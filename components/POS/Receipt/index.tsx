// components/POS/Receipt/index.tsx
"use client";

import type { POSCartItem } from "../types";
import "./styles.scss";

interface ReceiptProps {
  orderNumber: string;
  items: POSCartItem[];
  totalCents: number;
  customerEmail?: string | null;
  onNewSale: () => void;
}

function fmtPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function Receipt({
  orderNumber,
  items,
  totalCents,
  customerEmail,
  onNewSale,
}: ReceiptProps) {
  return (
    <div className="pos-receipt">
      {/* Success mark */}
      <div className="pos-receipt__success">
        <div className="pos-receipt__check-ring">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="pos-receipt__title">Yeehaw! 🤠</h2>
        <p className="pos-receipt__subtitle">
          {customerEmail
            ? <>Receipt sent to <strong>{customerEmail}</strong></>
            : "Walk-up sale recorded."}
        </p>
      </div>

      {/* Receipt card */}
      <div className="pos-receipt__card">
        {/* Card header */}
        <div className="pos-receipt__card-header">
          <div>
            <p className="pos-receipt__card-label">Desert Cowgirl Co.</p>
            <p className="pos-receipt__card-sublabel">{orderNumber}</p>
          </div>
          <p className="pos-receipt__card-date">{fmtDate()}</p>
        </div>

        {/* Divider */}
        <div className="pos-receipt__divider" aria-hidden>
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="pos-receipt__divider-dash" />
          ))}
        </div>

        {/* Line items */}
        <div className="pos-receipt__items">
          {items.map((item) => (
            <div key={item.key} className="pos-receipt__item">
              <div className="pos-receipt__item-info">
                <span className="pos-receipt__item-name">{item.product_title}</span>
                {item.variant_title && item.variant_title !== "Default" && item.variant_title !== "" && (
                  <span className="pos-receipt__item-variant">{item.variant_title}</span>
                )}
              </div>
              <div className="pos-receipt__item-right">
                <span className="pos-receipt__item-qty">×{item.quantity}</span>
                <span className="pos-receipt__item-price">
                  {fmtPrice(item.price_cents * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="pos-receipt__divider" aria-hidden>
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="pos-receipt__divider-dash" />
          ))}
        </div>

        {/* Total */}
        <div className="pos-receipt__total">
          <span>Total</span>
          <span>{fmtPrice(totalCents)}</span>
        </div>

        {/* Paid stamp */}
        <div className="pos-receipt__paid">PAID</div>
      </div>

      {/* Actions */}
      <div className="pos-receipt__actions">
        <button
          type="button"
          className="pos-receipt__btn pos-receipt__btn--secondary"
          onClick={() => window.print()}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print
        </button>

        <button
          type="button"
          className="pos-receipt__btn pos-receipt__btn--primary"
          onClick={onNewSale}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          New Sale
        </button>
      </div>
    </div>
  );
}