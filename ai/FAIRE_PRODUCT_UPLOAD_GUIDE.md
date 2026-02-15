# 📦 Product Upload Guide: Faire.com to Desert Cowgirl

## Product Type 1: Multi-Size, Single-Color Products

**Example:** Brown Western Aztec Printed Open Front Long Cardigan

---

### 📋 Step-by-Step Upload Process

#### 1. **Gather Product Information from Faire**

From the Faire product page, collect:

**Basic Details:**
- Title: "Brown Western Aztec Printed Open Front Long Cardigan"
- Price: $27.00 MSRP
- Description: Full product description from Faire
- SKU Pattern: `LC2542552-P1720` (remove the size suffix from any size-specific SKU)

**Variant Options:**
- **Sizes:** M, S, L, XL (list all available sizes)
- **Color:** Brown (single color)
- **Material:** 95%Polyester+5%Elastane
- **Made In:** China

**Additional Details:**
- Weight per size (if available)
- Stock quantities per size

---

#### 2. **Open Create Product Modal**

In Desert Cowgirl dashboard → Products → Click "Create Product"

---

#### 3. **Fill in Basic Product Information**

**Title:**
```
Brown Western Aztec Printed Open Front Long Cardigan
```

**Slug:** Click "Auto" to generate automatically
```
brown-western-aztec-printed-open-front-long-cardigan
```

**Price (USD):**
```
27.00
```

**Base SKU:**
```
LC2542552-P1720
```
⚠️ **Important:** Remove any size suffix (like -S, -M) from the SKU. The system will auto-append sizes.

**Description:**
```
The cardigan shows a captivating Western-inspired Aztec print, bringing a unique and cultural touch to your wardrobe.
Designed with an open front, this cardigan allows for versatile styling and an effortless layering piece.
The long cardigan provides extra coverage and a dramatic silhouette perfect for making a statement.
Made with a soft material, it's ideal for keeping warm while adding a fashionable layer to any outfit.
```

---

#### 4. **Upload Images** (Optional for now)

Collapse the Images section or upload product photos if available.

---

#### 5. **Configure Variants**

Expand the "Variants" section.

**Add Sizes:**
1. Click "+" next to Sizes
2. Add each size: M, S, L, XL
3. Enter exact size values from Faire

**Add Color:**
1. Click "+" next to Colors
2. Name: `Brown`
3. Color: Pick brown color (or use hex `#8B4513`)

**Add Material:**
1. Click "+" next to Materials
2. Enter: `95%Polyester+5%Elastane`

**Add Made In:**
1. Click "+" next to Made In
2. Enter: `China`

---

#### 6. **Generate Variants**

Click the **"🔄 Generate Variants from Options"** button.

**Expected Result:** 4 variant cards appear automatically:
- Variant 1: M
- Variant 2: S
- Variant 3: L
- Variant 4: XL

Each variant will show:
- **Title:** Size letter (e.g., "M")
- **SKU:** Auto-generated (e.g., `LC2542552-P1720-M`)
- **Select Options:** Size + Brown color pre-selected
- **Weight (g):** Leave empty or add if known
- **Initial Stock:** Enter quantity available

---

#### 7. **Fill Variant-Specific Details**

For each variant, enter:

**Stock Quantities:**
```
Variant M: 10 units
Variant S: 10 units
Variant L: 10 units
Variant XL: 10 units
```

**Weights (optional):**
```
Based on Faire details:
S: 310g
M: 330g
L: 340g
XL: 380g
```

---

#### 8. **Assign Categories** (Optional)

Expand Categories section and select relevant categories:
- TOPS
- OUTERWEAR
- etc.

---

#### 9. **Assign Collections** (Optional)

Expand Collections and select:
- New Arrivals
- Best Sellers
- etc.

---

#### 10. **Create Product**

Click **"Create Product"** button.

**Console Logs to Verify Success:**
```
✅ POST /api/products/admin 200
✅ POST /api/products/admin/{id}/variants 200 (x4)
✅ POST /api/products/admin/{id}/images 200 (if images uploaded)
✅ GET /api/products/admin 200
```

---

### ✅ Verification Checklist

After creation, go to **Manage Product → Advanced** and verify:

**Variants (4):**
- [ ] M - SKU: `LC2542552-P1720-M`, Stock: 10 units
- [ ] S - SKU: `LC2542552-P1720-S`, Stock: 10 units
- [ ] L - SKU: `LC2542552-P1720-L`, Stock: 10 units ⚠️
- [ ] XL - SKU: `LC2542552-P1720-XL`, Stock: 10 units

**Variant Options Saved:**
Each variant should show:
```json
{
  "size": "M",
  "color": {"name": "Brown", "hex": "#000000"},
  "material": "95%Polyester+5%Elastane",
  "made_in": "China"
}
```

---

### 🐛 Known Issues & Workarounds

#### Issue 1: Variant L shows SKU "10" instead of full SKU

**Cause:** User accidentally typed "10" in the SKU field for variant L instead of leaving it blank.

**Fix:** 
- Leave SKU fields **empty** for auto-generation
- Only fill custom SKUs if you want to override the auto-generated format

**SQL Fix (if needed):**
```sql
UPDATE product_variants 
SET sku = 'LC2542552-P1720-L' 
WHERE sku = '10' AND title = 'L';
```

#### Issue 2: Weight not saving

**Cause:** Weight field was left empty during creation.

**Fix:** Can be updated later in Manage Product → Advanced → Edit Variant

---

### 📊 Expected Database Structure

**Product:**
```
title: "Brown Western Aztec Printed Open Front Long Cardigan"
slug: "brown-western-aztec-printed-open-front-long-cardigan"
price_cents: 2700
status: "draft"
```

**Variants:**
```
M:  SKU: LC2542552-P1720-M, Stock: 10, Options: {size, color, material, made_in}
S:  SKU: LC2542552-P1720-S, Stock: 10, Options: {size, color, material, made_in}
L:  SKU: LC2542552-P1720-L, Stock: 10, Options: {size, color, material, made_in}
XL: SKU: LC2542552-P1720-XL, Stock: 10, Options: {size, color, material, made_in}
```

---

## 🎯 Success Criteria

✅ Product created with correct title, slug, price
✅ 4 variants auto-generated with unique SKUs
✅ All variant options (size, color, material, made_in) saved correctly
✅ Stock quantities tracked properly
✅ Categories and collections assigned

---

## 📝 Notes for Future Product Types

This guide covers **Type 1: Multi-Size, Single-Color** products.

**Future sections to add:**
- Type 2: Single-Size, Multi-Color
- Type 3: Multi-Size, Multi-Color
- Type 4: One-Size-Fits-All
- Type 5: Products with custom options (engravings, etc.)

---

**Last Updated:** February 14, 2026
**Version:** 1.0
**Test Product:** Brown Western Aztec Printed Open Front Long Cardigan
Perfect — then this is **not** Type 4 (single variant).

This becomes:

# TYPE 4

# Multi-Color Only (No Size Matrix)

(Accessory / Hat / One Size)

This is used when:

* One size (OSFM / Adjustable)
* Multiple colorways
* No size matrix
* One weight per color (usually same weight)

---

# TYPE 4 – Multi-Color, One Size Product

Example: **Howdy Honey Western Trucker Hat**

Colors:

* Tan/Brown
* Tan/Camo

No size options.

---

## 1️⃣ Basic Product Setup

Title:

```
Howdy Honey Western Trucker Hat
```

Slug:
Click **Auto**

Price:

```
25.00
```

---

## 2️⃣ Base SKU

If vendor SKU is not provided, create normalized internal SKU:

Example:

```
WSP-HOWDY-HAT
```

We will let the system append color logic (if used),
or manually control per variant if needed.

---

## 3️⃣ Product-Level Metadata

Made In:

```
United States
```

Material:
Leave blank unless confirmed.

Do NOT duplicate this in description.

---

## 4️⃣ Description (Filtered Properly)

Remove:

* Wholesale marketplace language
* Shipping details
* “Unlock wholesale pricing”
* Packaging notes
* Screen color disclaimer

Keep clean product-focused content:

```
Show off your style in our Howdy Honey Country Western puff trucker hat.

Features:
- “Howdy Honey” in red puff ink
- Removable small pin attached to each hat
- Individually heat pressed
- 5-panel construction
- Mesh back with snapback closure
```

Keep formatting clean and readable.

---

## 5️⃣ Images + ALT Coordination (Important)

Because this is color-based:

Each image ALT must match the color variant exactly.

Example:

Image 1 ALT:

```
Howdy Honey Trucker Hat – Tan/Brown
```

Image 2 ALT:

```
Howdy Honey Trucker Hat – Tan/Camo
```

This keeps frontend mapping clean and allows color-image linking logic later.

---

## 6️⃣ Variants Section

Do NOT add sizes.

Under **Colors**, add:

* Tan/Brown
* Tan/Camo

Then click:

🔄 Generate Variants (Color x Size)

Since no sizes exist, system will generate:

2 variants total.

---

## 7️⃣ Variant Configuration

Each variant will be:

Variant 1:
Tan/Brown

Variant 2:
Tan/Camo

SKU handling:

If using base SKU:
System may append color automatically.

If manually setting:

```
WSP-HOWDY-HAT-TANBRN
WSP-HOWDY-HAT-TANCAMO
```

Weight:

```
85.05
```

Enter weight for both variants (if same).

Initial Stock:
Set individually per color.

---

## 8️⃣ Expected Result After Create

System creates:

1 Product
2 Variants (one per color)
No size matrix
Weight stored at variant level
Clean ALT ↔ color alignment

---

## ✅ Final Checklist Before Create

* [ ] Clean description (filtered)
* [ ] Color names match image ALT
* [ ] No size options added
* [ ] 2 variants generated
* [ ] Weight entered per variant
* [ ] SKUs normalized
* [ ] Categories + Collections selected

---

# 🔹 Product Upload – Type 6 (Revised)

## Multi-Size Product (Weight Stored on Size Level)

Example:
**Wranglin’ Country Western Graphic Crewneck**

---

# 🧠 Key UI Behavior (Important)

In this product type:

* Weight is entered inside **Sizes & Weights**
* You must **click the size pill** to edit its weight
* The weight auto-populates into the generated variants
* You do NOT manually type weight inside each variant card

This is critical.

---

# 🛠 Step 1 – Add Sizes (With Weight)

In **Sizes & Weights**:

Add:

```
S
M
L
XL
2XL
```

Then:

👉 Click on each size
👉 Enter weight in grams

Vendor weight:

```
453.59 g
```

Since vendor does not differentiate by size, enter:

```
454
```

for all sizes.

If actual weights vary, enter per size.

Example:

| Size | Weight (g) |
| ---- | ---------- |
| S    | 430        |
| M    | 450        |
| L    | 470        |
| XL   | 490        |
| 2XL  | 510        |

---

# ⚠ Important

If you do not click the size and enter weight:

* Generated variants will have empty weight
* Shipping calculations will be incorrect

Weight must exist at the size level BEFORE generating variants.

---

# 🎛 Step 2 – Generate Variants

After all sizes have weight assigned:

Click:

```
Generate Variants (Color x Size)
```

Since no colors exist, it will create:

```
S
M
L
XL
2XL
```

Each variant will now automatically inherit:

```
weight_grams
```

You do not need to re-enter weight inside the variant card.

---

# 📦 Step 3 – Inventory

Now open each variant and set:

```
Initial Stock
```

Leave weight alone unless overriding.

---

# 🧬 What Happens in Database

Variant stored as:

```json
{
  "size": "M",
  "material": "50% Cotton / 50% Polyester",
  "made_in": "United States"
}
```

And:

```
weight_grams: 454
```

pulled from the Size configuration.

---

# ✅ Correct Flow Order

1. Add Sizes
2. Click each size → Enter weight (grams)
3. Generate Variants
4. Add stock
5. Create product
