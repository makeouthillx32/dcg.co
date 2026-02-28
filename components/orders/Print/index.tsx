'use client';

// components/orders/OrderDetailsDialog/index.tsx

import { useState } from 'react';
import { AdminOrder } from '@/lib/orders/types';
import { X, Printer, CheckCircle2, Package, MapPin, Star, User, Loader2, RefreshCw } from 'lucide-react';
import { PackagePicker } from '../PackagePicker';
import { printStoredLabel } from '../Print';

function gramsToOz(g: number) {
  return Math.round((g / 28.3495) * 100) / 100;
}

interface Props {
  order: AdminOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFulfill: (order: AdminOrder, trackingNumber?: string) => Promise<void>;
  onPrint: (order: AdminOrder) => void; // kept for grid-level compat
}

export function OrderDetailsDialog({ order, open, onOpenChange, onFulfill, onPrint }: Props) {
  const [trackingNumber, setTrackingNumber]   = useState(order.tracking_number ?? '');
  const [trackingUrl, setTrackingUrl]         = useState(order.tracking_url ?? '');
  const [extraWeightOz, setExtraWeightOz]     = useState('');
  const [fulfilling, setFulfilling]           = useState(false);
  const [fulfilled, setFulfilled]             = useState(order.fulfillment_status === 'fulfilled');

  // Label states
  const [showPicker, setShowPicker]           = useState(false);
  const [reprinting, setReprinting]           = useState(false);
  const [labelError, setLabelError]           = useState<string | null>(null);
  // Whether a paid label already exists for this order
  const hasStoredLabel = !!(order as any).label_pdf_path;

  if (!open) return null;

  const addr = order.shipping_address;
  const customerName = addr
    ? [addr.firstName, addr.lastName].filter(Boolean).join(' ')
    : [order.customer_first_name, order.customer_last_name].filter(Boolean).join(' ') || order.email;

  // Weight calc
  const totalWeightGrams = order.items.reduce(
    (sum, item) => sum + (item.weight_grams ?? 0) * item.quantity, 0
  );
  const totalWeightOz   = Math.round((totalWeightGrams / 28.3495) * 100) / 100;
  const extraOz         = parseFloat(extraWeightOz) || 0;
  const packageWeightOz = Math.round((totalWeightOz + extraOz) * 100) / 100;
  const packageLb       = Math.floor(packageWeightOz / 16);
  const packageRemOz    = Math.round((packageWeightOz % 16) * 100) / 100;
  const hasAllWeights   = order.items.every((i) => i.weight_grams != null);

  const isFulfilled = fulfilled || order.fulfillment_status === 'fulfilled';

  // ── Reprint stored label ─────────────────────────────────────
  async function handleReprint() {
    setReprinting(true);
    setLabelError(null);
    try {
      const result = await printStoredLabel(order.id);
      // Keep tracking fields in sync if they somehow changed
      if (result.trackingNumber) setTrackingNumber(result.trackingNumber);
      if (result.trackingUrl)    setTrackingUrl(result.trackingUrl);
    } catch (err: any) {
      setLabelError(err.message ?? 'Failed to fetch label');
    } finally {
      setReprinting(false);
    }
  }

  // ── PackagePicker success callback ───────────────────────────
  // Called after a new label is generated. Tracking fields auto-fill.
  function handleLabelSuccess(newTracking: string, newTrackingUrl: string) {
    setShowPicker(false);
    setLabelError(null);
    if (newTracking)    setTrackingNumber(newTracking);
    if (newTrackingUrl) setTrackingUrl(newTrackingUrl);
  }

  // ── Fulfill ─────────────────────────────────────────────────
  async function handleFulfill() {
    setFulfilling(true);
    try {
      await onFulfill(order, trackingNumber.trim() || undefined);
      setFulfilled(true);
    } catch (err: any) {
      alert(err.message ?? 'Failed to mark fulfilled');
    } finally {
      setFulfilling(false);
    }
  }

  return (
    <>
      {/* PackagePicker modal — shown when generating a new label */}
      {showPicker && (
        <PackagePicker
          order={order}
          onSuccess={handleLabelSuccess}
          onClose={() => setShowPicker(false)}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
        <div className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-xl shadow-2xl max-h-[92vh] overflow-y-auto">

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg">#{order.order_number}</span>
                {order.is_member ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> Member
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border bg-gray-50 text-gray-500 border-gray-200">
                    <User className="w-3 h-3" /> Guest
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                })}
              </div>
            </div>

            {/* Print buttons */}
            <div className="flex items-center gap-2">
              {hasStoredLabel ? (
                // Label already paid for — reprint from storage (free)
                <button
                  onClick={handleReprint}
                  disabled={reprinting}
                  title="Reprint stored label"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {reprinting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <RefreshCw className="w-4 h-4" />}
                  <span className="hidden sm:inline">Reprint Label</span>
                </button>
              ) : (
                // No label yet — open PackagePicker to generate one
                <button
                  onClick={() => setShowPicker(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print Label</span>
                </button>
              )}
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5">

            {/* Label error */}
            {labelError && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                <span>⚠ {labelError}</span>
                <button className="ml-auto text-red-400 hover:text-red-600" onClick={() => setLabelError(null)}>×</button>
              </div>
            )}

            {/* ── Status badges ── */}
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isFulfilled
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {isFulfilled ? 'Fulfilled' : 'Unfulfilled'}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                order.payment_status === 'paid'
                  ? 'bg-green-50 text-green-700 border-green-100'
                  : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                {order.payment_status?.toUpperCase()}
              </span>
              {order.shipping_method_name && (
                <span className="text-xs px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-600">
                  {order.shipping_method_name}
                </span>
              )}
              {/* Label cost badge */}
              {(order as any).label_postage_cents > 0 && (
                <span className="text-xs px-3 py-1 rounded-full border border-blue-100 bg-blue-50 text-blue-700 font-mono">
                  Label: ${((order as any).label_postage_cents / 100).toFixed(2)}
                </span>
              )}
            </div>

            {/* ── Member points callout ── */}
            {order.is_member && (
              <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-yellow-800">
                    {order.points_earned > 0
                      ? `+${order.points_earned} points earned on this order`
                      : 'Member order'}
                  </div>
                </div>
              </div>
            )}

            {/* ── Ship To ── */}
            <section>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                <MapPin className="w-3 h-3" /> Ship To
              </div>
              <div className="text-sm space-y-0.5">
                <div className="font-semibold">{customerName}</div>
                {addr?.address1 && <div className="text-gray-600">{addr.address1}</div>}
                {addr?.address2 && <div className="text-gray-600">{addr.address2}</div>}
                {(addr?.city || addr?.state || addr?.zip) && (
                  <div className="text-gray-600">
                    {[addr?.city, addr?.state].filter(Boolean).join(', ')} {addr?.zip}
                  </div>
                )}
                {addr?.country && addr.country !== 'US' && addr.country !== 'United States' && (
                  <div className="text-gray-600">{addr.country}</div>
                )}
                {addr?.phone && <div className="text-gray-500 text-xs">{addr.phone}</div>}
                <div className="text-xs text-gray-400 pt-0.5">{order.email}</div>
              </div>
            </section>

            {/* ── Items ── */}
            <section>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                <Package className="w-3 h-3" /> Items
              </div>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start text-sm">
                    <span className="font-bold text-gray-900 w-5 text-right shrink-0">{item.quantity}×</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.title}</div>
                      {item.variant_title && item.variant_title !== 'Default' && (
                        <div className="text-xs text-gray-500">{item.variant_title}</div>
                      )}
                      {item.sku && <div className="text-xs text-gray-400 font-mono">{item.sku}</div>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold">${(item.price_cents / 100).toFixed(2)}</div>
                      {item.weight_grams && (
                        <div className="text-xs text-gray-400 font-mono">{gramsToOz(item.weight_grams)} oz</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Totals ── */}
            <section>
              <div className="border-t pt-3 space-y-1 text-sm">
                {order.subtotal_cents != null && (
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span><span>${(order.subtotal_cents / 100).toFixed(2)}</span>
                  </div>
                )}
                {(order.shipping_cents ?? 0) > 0 ? (
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span><span>${(order.shipping_cents! / 100).toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span><span className="text-green-600">FREE</span>
                  </div>
                )}
                {(order.tax_cents ?? 0) > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Tax</span><span>${(order.tax_cents! / 100).toFixed(2)}</span>
                  </div>
                )}
                {(order.discount_cents ?? 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span><span>–${(order.discount_cents! / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-base pt-1 border-t">
                  <span>Total</span><span>${(order.total_cents / 100).toFixed(2)}</span>
                </div>
              </div>
            </section>

            {/* ── Package weight ── */}
            <section>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                <Package className="w-3 h-3" /> Package Weight
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-sm">
                  {packageWeightOz > 0
                    ? packageLb > 0 ? `${packageLb} lb ${packageRemOz} oz` : `${packageWeightOz} oz`
                    : <span className="text-amber-500 font-normal">Weigh manually</span>}
                </span>
                <div className="flex items-center gap-1.5 ml-auto">
                  <label className="text-xs text-gray-500">+ packaging oz</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    value={extraWeightOz}
                    onChange={(e) => setExtraWeightOz(e.target.value)}
                    className="w-16 border border-gray-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-black/10"
                  />
                </div>
              </div>
              {!hasAllWeights && (
                <div className="text-xs text-amber-600 mt-1">
                  ⚠ Some items are missing weight data — add them in Products → Variants.
                </div>
              )}
            </section>

            {/* ── Fulfill ── */}
            {!isFulfilled && (
              <section>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  <CheckCircle2 className="w-3 h-3" /> Mark Fulfilled
                </div>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="tracking" className="block text-xs text-gray-500 mb-1">
                      Tracking number
                      {trackingNumber && <span className="text-green-600 ml-1">(auto-filled from label)</span>}
                    </label>
                    <input
                      id="tracking"
                      type="text"
                      placeholder="e.g. 9400111899223397658538"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                  {/* Prompt to generate label first if none exists */}
                  {!hasStoredLabel && !trackingNumber && (
                    <button
                      onClick={() => setShowPicker(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 text-gray-500 rounded-lg text-sm hover:border-gray-300 hover:text-gray-700 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      Generate shipping label first (optional)
                    </button>
                  )}
                  <button
                    onClick={handleFulfill}
                    disabled={fulfilling}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg font-semibold text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {fulfilling ? 'Marking fulfilled…' : 'Mark as Fulfilled'}
                  </button>
                </div>
              </section>
            )}

            {isFulfilled && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-sm text-green-700 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                This order has been fulfilled.
                {(order.tracking_number || trackingNumber) && (
                  <span className="font-mono text-green-600 ml-1 text-xs">
                    {order.tracking_number ?? trackingNumber}
                  </span>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}