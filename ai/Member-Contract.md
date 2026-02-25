## Member Contract v1 (Signed-in user)

A **member** is an authenticated user with a valid session (Supabase Auth) and a corresponding `profiles` row.

### Members can access

* Everything a guest can access (full shop browsing, cart, checkout).
* `/profile/me` and all account pages:

  * view/update profile (display name, avatar)
  * saved addresses (if you support them)
  * order history + order details (when implemented)
* Any "member-only" features you add later (favorites/wishlist, saved carts, etc.).

### Members cannot access

* Any admin-only areas (`/dashboard/*`, `/settings/*`, management UIs) unless their role grants it.

### Required UX behavior

* If a member visits a **member-only page**, it must load without re-auth prompts or dead-ends.
* If a member visits an **admin-only page** without permission, they must get a clean **403/Not allowed** (or redirect to `/profile/me`), not a sign-in prompt.

---

## Member Identity Architecture

### What "member" means in the database

A member has rows in **both** `profiles` (auth/role layer) and `customers` (shopping identity layer). Both must be populated on sign-up.

**`profiles` row — required fields:**

| Field | Value |
|---|---|
| `id` | Same UUID as `auth.users.id` |
| `auth_user_id` | Same UUID as `id` (email signups) |
| `email` | Lowercased snapshot from sign-up form |
| `role` | `'member'` |
| `display_name` | `"First Last"` |
| `first_name` / `last_name` | From sign-up form |

**`customers` row — required fields:**

| Field | Value |
|---|---|
| `auth_user_id` | Links to `profiles.auth_user_id` |
| `email` | Same snapshot |
| `type` | `'member'` |
| `guest_key` | `NULL` (members don't need one) |
| `order_count` / `total_spent_cents` | Auto-updated by trigger on payment |

### How sign-up writes both rows

`signUpAction` in `actions/auth/actions.ts`:

1. Calls `supabase.auth.signUp()` → creates `auth.users` row
2. Upserts `profiles` with `auth_user_id`, `email`, `role: 'member'`, name fields
3. Upserts `customers` with `auth_user_id`, `type: 'member'` — uses `onConflict: "auth_user_id"`
4. If `dcg_guest_key` cookie is present, calls `claim_guest_orders()` to backfill any past guest orders onto the new auth account

### Identity + data rules

* The current user identity is determined by session; `/profile/me` always resolves to the signed-in user.
* If a member tries `/profile/{someone-else}`, they are redirected to `/profile/me`.
* Orders created while signed in must have `auth_user_id`, `profile_id`, and `customer_id` all populated (not null).
* `guest_key` on orders is `NULL` for member orders.

### Orders for members

| Field | Member value |
|---|---|
| `orders.profile_id` | `auth.users.id` |
| `orders.auth_user_id` | `auth.users.id` |
| `orders.customer_id` | `customers.id` |
| `orders.guest_key` | `NULL` |
| `orders.email` | Email snapshot (still required for receipts) |

### Protected route enforcement

`lib/protectedRoutes.ts` is the single source of truth. Both `middleware.ts` and `provider.tsx` import from it. Members pass all protected route checks automatically once session is established.

---

## Sign-up verification checklist

After a new member signs up, confirm in Supabase:

```sql
-- profiles row must have auth_user_id and email populated
SELECT id, auth_user_id, email, role FROM profiles
WHERE email = '<signup email>';

-- customers row must exist with type = 'member'
SELECT id, auth_user_id, email, type, guest_key FROM customers
WHERE email = '<signup email>';
```

✅ Pass: both rows exist, `profiles.auth_user_id` is not null, `customers.type = 'member'`
❌ Fail: `auth_user_id` is null on profiles (old bug — fixed in `actions.ts`), or customers row missing (check `onConflict` target is `auth_user_id`)

---

## Test Account

**membersz man** — `makeouthillx32@gmail.com`

| | |
|---|---|
| `profiles.id` | `6509909a-aec6-43ef-8024-240c8416dc61` |
| `customers.id` | `5d0bede8-1561-4717-8972-c9ba46655c25` |
| `customers.type` | `member` |
| Test order | `DCG-MEMBER-TEST-001` |
| Order status | `processing` / `paid` |
| Total | $68.04 |
| Items | Howdy Darlin' Hat (Black) + Wranglin' Sweatshirt (XL) |
| `profile_id` | ✅ populated |
| `auth_user_id` | ✅ populated |
| `customer_id` | ✅ populated |
| `guest_key` | `NULL` ✅ |
| Fulfillment | `unfulfilled` — ready for Orders Manager test |