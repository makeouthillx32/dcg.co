
## Guest Contract v1

A guest user must be able to:

* browse the shop (home/landing, collections, categories, product pages)
* search/filter/sort
* add/remove/update cart
* start checkout and complete purchase as guest
* view static pages (About, Terms, Privacy, etc.)

A guest user must NOT be able to:

* view `/profile/*`
* view order history / saved addresses
* access `/dashboard/*` or `/settings/*`

**All member-only pages must redirect cleanly to sign-in with a `next=` param. No “unauthorized” dead-ends.**

---

## Guest Test Script (incognito)

Do these in order and tell me the first failure.

### A) Public browsing (must work, no auth prompt)

1. `/` (or `/landing`) loads
2. Navigate to a category page
3. Navigate to a collection page
4. Open 3 different product pages
5. Any “featured/bestsellers” grids load without 401 errors

✅ Pass: no redirect to sign-in, no “unauthorized”, no blank content.

### B) Cart (must work, persistent within the session)

6. Add product A to cart
7. Add product B to cart
8. Change quantity
9. Remove product B
10. Refresh page and verify cart still reflects current state

✅ Pass: cart persists through refresh (cookie or local cart id) and renders images/prices.

### C) Checkout as guest (must work end-to-end)

11. Click checkout
12. Enter shipping info + email
13. Proceed to payment step (Stripe)
14. Back out and return to cart (no broken state)
15. Complete test purchase (Stripe test card) **or** stop at payment creation

✅ Pass: guest can reach Stripe checkout/payment intent creation without being forced to sign in.

### D) Protected routes (must redirect nicely)

16. Go to `/profile/me`
17. Go to any `/dashboard/*` route you know exists
18. Go to `/settings/*`

✅ Pass: **redirect to** `/sign-in?next=...` (or your sign-in route)
❌ Fail: 401 JSON, “unauthorized” page, or infinite redirect loop.

---

## What I want you to capture (super quick)

For each fail, paste:

* the URL you were on
* what it did (redirect, error message, blank, toast)
* the Network request that failed (usually `/api/*` returning 401/403)

---

## The most common causes (so you know what we’re hunting)

* A “public” page is calling an API route that **requires auth** (returns 401)
* Middleware/route group is unintentionally protecting routes that should be public
* Header/mobile drawer is rendering auth-only links and then causing a navigation into protected pages without redirect UX
* Cart/checkout endpoints are requiring auth instead of using guest cart id

---

## One concrete rule to implement while you test

If a guest hits a protected page, it should always go:

`/sign-in?next=<original-url>`

Not an error screen.

---

When you run the guest test, just reply with:

* **PASS** up to step X
* first failure details (url + what happened + 401/403 request)

…and we’ll harden that exact spot first.
