'use client';

// components/orders/OrderDetailsDialog/index.tsx

import { useState } from 'react';
import { AdminOrder, FulfillmentStatus } from '@/lib/orders/types';
import { X, Printer, CheckCircle2, Package, Truck, MapPin, Star, User } from 'lucide-react';

function gramsToOz(g: number) {
  return Math.round((g / 28.3495) * 100) / 100;
}

interface Props {
  order: AdminOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFulfill: (order: AdminOrder, trackingNumber?: string) => Promise<void>;
  onPrint: (order: AdminOrder) => void;
}

export function OrderDetailsDialog({ order, open, onOpenChange, onFulfill, onPrint }: Props) {
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number ?? '');
  const [extraWeightOz, setExtraWeightOz] = useState('');
  const [fulfilling, setFulfilling] = useState(false);
  const [fulfilled, setFulfilled] = useState(order.fulfillment_status === 'fulfilled');

  if (!open) return null;

  const addr = order.shipping_address;
  const customerName = addr
    ? [addr.firstName, addr.lastName].filter(Boolean).join(' ')
    : [order.customer_first_name, order.customer_last_name].filter(Boolean).join(' ') || order.email;

  // Weight
  const totalWeightGrams = order.items.reduce(
    (sum, item) => sum + (item.weight_grams ?? 0) * item.quantity, 0
  );
  const totalWeightOz = Math.round((totalWeightGrams / 28.3495) * 100) / 100;
  const extraOz = parseFloat(extraWeightOz) || 0;
  const packageWeightOz = Math.round((totalWeightOz + extraOz) * 100) / 100;
  const packageLb = Math.floor(packageWeightOz / 16);
  const packageRemOz = Math.round((packageWeightOz % 16) * 100) / 100;
  const hasAllWeights = order.items.every((i) => i.weight_grams != null);

  const handleFulfill = async () => {
    setFulfilling(true);
    try {
      await onFulfill(order, trackingNumber.trim() || undefined);
      setFulfilled(true);
    } catch (err: any) {
      alert(err.message ?? 'Failed to mark fulfilled');
    } finally {
      setFulfilling(false);
    }
  };

  const isFulfilled = fulfilled || order.fulfillment_status === 'fulfilled';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-xl shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg">#{order.order_number}</span>
              {/* Identity badge */}
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(order)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Slip</span>
            </button>
            <button onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">

          {/* ── Status row ── */}
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
          </div>

          {/* ── Member points callout ── */}
          {order.is_member && (
            <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-yellow-800">
                  {order.points_earned > 0
                    ? `+${order.points_earned} points earned on this order`
                    : 'Member order — points will be credited'}
                </div>
                <div className="text-xs text-yellow-600 mt-0.5">
                  1 point per $1 spent on subtotal · Points system coming soon
                </div>
              </div>
            </div>
          )}

          {/* ── Guest note ── */}
          {order.is_guest && (
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="text-sm text-gray-500">
                Guest order — no account attached.{' '}
                <span className="text-gray-400 text-xs">
                  Customer can claim this order by signing up with the same email.
                </span>
              </div>
            </div>
          )}

          {/* ── Ship To ── */}
          <section>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              <MapPin className="w-3 h-3" /> Ship To
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-0.5">
              <div className="font-semibold">{customerName}</div>
              {addr?.address1 && <div>{addr.address1}</div>}
              {addr?.address2 && <div>{addr.address2}</div>}
              {(addr?.city || addr?.state || addr?.zip) && (
                <div>{[addr?.city, addr?.state].filter(Boolean).join(', ')} {addr?.zip}</div>
              )}
              <div className="text-gray-500">{addr?.country ?? 'United States'}</div>
              {addr?.phone && <div className="text-gray-500">{addr.phone}</div>}
              <div className="text-gray-500 pt-0.5">{order.email}</div>
            </div>
          </section>

          {/* ── Items ── */}
          <section>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              <Package className="w-3 h-3" /> Items
            </div>
            <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 overflow-hidden">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="bg-gray-100 text-gray-700 font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      {item.quantity}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{item.title}</div>
                      {item.variant_title && item.variant_title !== 'Default' && (
                        <div className="text-xs text-gray-500">{item.variant_title}</div>
                      )}
                      <div className="text-xs text-gray-400 font-mono">{item.sku}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="font-mono font-medium">${(item.price_cents / 100).toFixed(2)}</div>
                    {item.weight_grams ? (
                      <div className="text-xs text-gray-400">{gramsToOz(item.weight_grams)} oz</div>
                    ) : (
                      <div className="text-xs text-amber-500">no weight</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Totals ── */}
          <section className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            {order.subtotal_cents != null && (
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${(order.subtotal_cents / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              {(order.shipping_cents ?? 0) > 0
                ? <span>${(order.shipping_cents! / 100).toFixed(2)}</span>
                : <span className="text-green-600 font-medium">FREE</span>
              }
            </div>
            {(order.tax_cents ?? 0) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${(order.tax_cents! / 100).toFixed(2)}</span>
              </div>
            )}
            {(order.discount_cents ?? 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>–${(order.discount_cents! / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-base pt-1 border-t border-gray-200">
              <span>Total</span>
              <span>${(order.total_cents / 100).toFixed(2)}</span>
            </div>
          </section>

          {/* ── Package weight ── */}
          <section>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              <Truck className="w-3 h-3" /> Package Weight
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-600">
                  <span className="truncate mr-2">
                    {item.quantity}× {item.title}
                    {item.variant_title && item.variant_title !== 'Default' ? ` (${item.variant_title})` : ''}
                  </span>
                  <span className="font-mono shrink-0">
                    {item.weight_grams
                      ? `${gramsToOz(item.weight_grams * item.quantity)} oz`
                      : <span className="text-amber-500">—</span>}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <label htmlFor="extra-weight" className="text-gray-600">+ Packaging / box (oz)</label>
                <input
                  id="extra-weight"
                  type="number" min="0" step="0.1" placeholder="0"
                  value={extraWeightOz}
                  onChange={(e) => setExtraWeightOz(e.target.value)}
                  className="w-20 text-right border border-gray-200 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                <span>Total package weight</span>
                <span className="font-mono">
                  {packageWeightOz > 0
                    ? packageLb > 0 ? `${packageLb} lb ${packageRemOz} oz` : `${packageWeightOz} oz`
                    : <span className="text-amber-500 font-normal">Weigh manually</span>}
                </span>
              </div>
              {!hasAllWeights && (
                <div className="text-xs text-amber-600">
                  ⚠ Some items are missing weight data — add them in Products → Variants.
                </div>
              )}
            </div>
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
                    Tracking number (optional)
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
  );
}