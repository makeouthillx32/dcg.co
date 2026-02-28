// app/api/orders/[id]/label/route.ts
// Generates a USPS shipping label for an order.
// 1. Fetches order from Supabase
// 2. Gets USPS OAuth + Payment tokens
// 3. Calls USPS Domestic Labels API
// 4. Parses multipart response → extracts PDF + tracking number
// 5. Saves tracking number + label URL to the order
// 6. Returns PDF blob to the browser

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabase/server';
import { getOAuthToken, getPaymentToken } from '@/lib/usps/tokens';
import { resolveMailClass, resolveRateIndicator } from '@/lib/usps/mailClass';

const USPS_BASE = process.env.USPS_ENV === 'production'
  ? 'https://apis.usps.com'
  : 'https://apis-tem.usps.com';

// ── Package dimensions payload from the request body ────────────
interface PackageDimensions {
  weightLb: number;      // e.g. 0.5
  lengthIn: number;      // e.g. 12
  widthIn: number;       // e.g. 9
  heightIn: number;      // e.g. 2
  presetName?: string;   // e.g. "Poly Mailer"
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();

    // ── Auth check: admin only ───────────────────────────────────
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── Parse package dimensions from request body ───────────────
    const body = await request.json() as PackageDimensions;
    const { weightLb, lengthIn, widthIn, heightIn, presetName } = body;

    if (!weightLb || !lengthIn || !widthIn || !heightIn) {
      return NextResponse.json(
        { error: 'Missing required package dimensions: weightLb, lengthIn, widthIn, heightIn' },
        { status: 400 }
      );
    }

    // ── Fetch order ──────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        shipping_address,
        shipping_method_name,
        customer_first_name,
        customer_last_name,
        email
      `)
      .eq('id', params.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const addr = order.shipping_address as {
      firstName?: string; lastName?: string;
      address1?: string; address2?: string;
      city?: string; state?: string; zip?: string;
      country?: string; phone?: string;
    } | null;

    if (!addr?.address1 || !addr?.city || !addr?.state || !addr?.zip) {
      return NextResponse.json(
        { error: 'Order is missing a complete shipping address' },
        { status: 400 }
      );
    }

    // ── Resolve mail class from order's shipping method ──────────
    const mailClass = resolveMailClass(order.shipping_method_name);
    const rateIndicator = resolveRateIndicator(mailClass);

    // ── Get USPS tokens ──────────────────────────────────────────
    const oauthToken = await getOAuthToken();
    const paymentToken = await getPaymentToken(oauthToken);

    // ── Build label request ──────────────────────────────────────
    const mailingDate = new Date().toISOString().split('T')[0]; // today YYYY-MM-DD

    const labelPayload = {
      imageInfo: {
        imageType: 'PDF',
        labelType: '4X6LABEL',
        receiptOption: 'NONE',
        suppressPostage: false,
        suppressMailDate: false,
        returnLabel: false,
      },
      toAddress: {
        firstName: addr.firstName ?? order.customer_first_name ?? '',
        lastName: addr.lastName ?? order.customer_last_name ?? '',
        streetAddress: addr.address1,
        secondaryAddress: addr.address2 ?? undefined,
        city: addr.city,
        state: addr.state,
        ZIPCode: addr.zip.replace(/\D/g, '').slice(0, 5),
      },
      fromAddress: {
        firstName: process.env.USPS_FROM_FIRST_NAME ?? '',
        lastName: process.env.USPS_FROM_LAST_NAME ?? '',
        firm: process.env.USPS_FROM_COMPANY ?? 'Desert Cowgirl Co.',
        streetAddress: process.env.USPS_FROM_STREET ?? '',
        city: process.env.USPS_FROM_CITY ?? '',
        state: process.env.USPS_FROM_STATE ?? '',
        ZIPCode: process.env.USPS_FROM_ZIP ?? '',
      },
      packageDescription: {
        mailClass,
        rateIndicator,
        weightUOM: 'lb',
        weight: weightLb,
        dimensionsUOM: 'in',
        length: lengthIn,
        width: widthIn,
        height: heightIn,
        processingCategory: 'MACHINABLE',
        mailingDate,
        destinationEntryFacilityType: 'NONE',
      },
    };

    // ── Call USPS Labels API ─────────────────────────────────────
    const uspsRes = await fetch(`${USPS_BASE}/labels/v3/label`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${oauthToken}`,
        'X-Payment-Authorization-Token': paymentToken,
      },
      body: JSON.stringify(labelPayload),
    });

    if (!uspsRes.ok) {
      const errText = await uspsRes.text();
      console.error('[USPS Label] API error:', uspsRes.status, errText);
      return NextResponse.json(
        { error: `USPS API error ${uspsRes.status}`, details: errText },
        { status: 502 }
      );
    }

    // ── Parse multipart response ─────────────────────────────────
    // USPS returns multipart/form-data with JSON metadata + PDF binary
    const contentType = uspsRes.headers.get('content-type') ?? '';
    const boundary = contentType.match(/boundary=([^\s;]+)/)?.[1];

    if (!boundary) {
      return NextResponse.json(
        { error: 'Unexpected USPS response format — no multipart boundary' },
        { status: 502 }
      );
    }

    const rawBuffer = await uspsRes.arrayBuffer();
    const { metadata, pdfBuffer } = parseMultipart(rawBuffer, boundary);

    if (!pdfBuffer) {
      return NextResponse.json(
        { error: 'USPS did not return a PDF label' },
        { status: 502 }
      );
    }

    const trackingNumber: string = metadata?.trackingNumber ?? '';
    const postage: number = metadata?.postage ?? 0;
    const trackingUrl: string =
      metadata?.links?.find((l: any) => l.rel?.includes('Tracking URL'))?.href
      ?? `https://tools.usps.com/go/TrackConfirmAction_input?origTrackNum=${trackingNumber}`;

    // ── Save tracking number + label info to order ───────────────
    if (trackingNumber) {
      await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber,
          tracking_url: trackingUrl,
          internal_notes: [
            order.order_number,
            `Label generated: ${new Date().toISOString()}`,
            `Package: ${presetName ?? `${lengthIn}x${widthIn}x${heightIn}in ${weightLb}lb`}`,
            `Mail class: ${mailClass}`,
            `Postage: $${postage.toFixed(2)}`,
          ].join(' | '),
        })
        .eq('id', params.id);
    }

    // ── Return PDF to browser ────────────────────────────────────
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="label-${order.order_number}.pdf"`,
        'X-Tracking-Number': trackingNumber,
        'X-Postage': String(postage),
        'X-Tracking-URL': trackingUrl,
      },
    });

  } catch (err: any) {
    console.error('[USPS Label] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}

// ── Multipart parser ─────────────────────────────────────────────
// USPS returns multipart/form-data. We need to extract:
//   - labelMetadata (JSON)  → tracking number, postage, etc.
//   - labelImage (PDF)      → binary PDF data
function parseMultipart(
  buffer: ArrayBuffer,
  boundary: string
): { metadata: any; pdfBuffer: ArrayBuffer | null } {
  const bytes = new Uint8Array(buffer);
  const decoder = new TextDecoder('utf-8');
  const boundaryBytes = new TextEncoder().encode(`--${boundary}`);

  // Split on boundary
  const parts: Uint8Array[] = [];
  let start = 0;

  for (let i = 0; i < bytes.length - boundaryBytes.length; i++) {
    let match = true;
    for (let j = 0; j < boundaryBytes.length; j++) {
      if (bytes[i + j] !== boundaryBytes[j]) { match = false; break; }
    }
    if (match) {
      if (start > 0) parts.push(bytes.slice(start, i));
      start = i + boundaryBytes.length;
    }
  }

  let metadata: any = null;
  let pdfBuffer: ArrayBuffer | null = null;

  for (const part of parts) {
    const partText = decoder.decode(part.slice(0, 512)); // read headers only

    // Find end of headers (double CRLF)
    let headerEnd = -1;
    for (let i = 0; i < part.length - 3; i++) {
      if (part[i] === 13 && part[i+1] === 10 && part[i+2] === 13 && part[i+3] === 10) {
        headerEnd = i + 4;
        break;
      }
    }
    if (headerEnd === -1) continue;

    const headers = partText.slice(0, headerEnd);
    const body = part.slice(headerEnd);

    if (headers.includes('application/json') || headers.includes('labelMetadata')) {
      try {
        metadata = JSON.parse(decoder.decode(body).trim());
      } catch { /* ignore */ }
    } else if (headers.includes('application/pdf') || headers.includes('labelImage')) {
      // Trim trailing CRLF from PDF body
      const trimmed = body[body.length - 2] === 13 && body[body.length - 1] === 10
        ? body.slice(0, -2)
        : body;
      pdfBuffer = trimmed.buffer.slice(trimmed.byteOffset, trimmed.byteOffset + trimmed.byteLength);
    }
  }

  return { metadata, pdfBuffer };
}