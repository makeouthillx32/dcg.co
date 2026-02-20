# CRITICAL: Desert Cowgirl Theme System Architecture Rules

## ⚠️ ABSOLUTE RULE: NEVER HARDCODE COLOR VALUES

This project uses a **Supabase-driven dynamic theme system**. NEVER suggest hardcoded HSL/RGB/hex values.

---

## 🎯 The System Architecture

### Database-Driven Themes
- All color values are stored in Supabase `themes` table
- `theme_data` JSONB column contains complete theme configurations
- Themes are loaded dynamically at runtime via `/app/provider.tsx`
- CSS variables are set via JavaScript: `html.style.setProperty(key, value)`

### Why This Matters
1. **Users can create custom themes** in the dashboard (`/dashboard/[id]/settings/thememaker`)
2. **Themes can be switched** without code changes
3. **Multiple themes exist**: default, monochrome, sharp, vintage (see `/themes/` directory)
4. **Light/dark modes** are handled per theme
5. **No rebuild required** for theme changes

---

## ✅ CORRECT: Always Reference Variables

### Layout Tokens (What We're Working With)
```css
:root {
  /* ✅ CORRECT - References theme system variables */
  --gp-bg:         hsl(var(--primary));
  --gp-fg:         hsl(var(--primary-foreground));
  --gp-border:     hsl(var(--primary) / 0.4);
  --gp-shadow:     var(--shadow-sm);
  --gp-status-bar: hsl(var(--primary));
}
```

### Available Theme Variables
From the theme system, these variables are ALWAYS available:
- `--background` / `--foreground`
- `--card` / `--card-foreground`
- `--popover` / `--popover-foreground`
- `--primary` / `--primary-foreground`
- `--secondary` / `--secondary-foreground`
- `--muted` / `--muted-foreground`
- `--accent` / `--accent-foreground`
- `--destructive` / `--destructive-foreground`
- `--border`
- `--input`
- `--ring`
- `--radius`
- Shadow tokens: `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
- Font tokens: `--font-sans`, `--font-serif`, `--font-mono`

---

## ❌ WRONG: Hardcoded Values

### Examples of What NOT To Do

```css
/* ❌ WRONG - Hardcoded HSL values */
:root {
  --gp-bg: hsl(0 84% 60%);
  --gp-fg: hsl(0 0% 98%);
}

/* ❌ WRONG - Hardcoded hex colors */
.header {
  background: #b91c1c;
  color: #ffffff;
}

/* ❌ WRONG - Suggesting specific color values */
"Try using hsl(120 100% 50%) for a green nav"
```

### Why These Are Wrong
1. Breaks when user switches themes
2. Ignores light/dark mode
3. Requires code changes for design updates
4. Defeats the entire purpose of the theme system

---

## 🎨 How to Suggest Theme Changes

### Instead of Hardcoded Values, Suggest Variable Mappings

**❌ WRONG Suggestion:**
```css
:root {
  --gp-bg: hsl(25 75% 60%);  /* Warm desert orange */
}
```

**✅ CORRECT Suggestion:**
```css
:root {
  /* Map to secondary for warm tones */
  --gp-bg: hsl(var(--secondary));
  --gp-fg: hsl(var(--secondary-foreground));
}
```

**✅ EVEN BETTER - Explain the Options:**
```markdown
For warmer nav feel, you can remap `--gp-bg` to different theme variables:

1. `hsl(var(--primary))` - Your main brand color
2. `hsl(var(--secondary))` - Typically warmer accent
3. `hsl(var(--accent))` - Alternative accent color
4. `hsl(var(--card))` - Elevated surface color
5. `hsl(var(--background))` - Page background color

Each will respect light/dark mode automatically.
```

---

## 🏗️ Layout Token System (`/style/layout-tokens.css`)

### Purpose
Provides a **semantic layer** between generic theme variables and specific UI contexts.

### Pattern
```css
/* Global Palette (gp) - Defines the base values */
:root {
  --gp-bg: hsl(var(--primary));
  --gp-fg: hsl(var(--primary-foreground));
}

/* Layout Tokens (lt) - Applied to specific contexts */
[data-layout="shop"] {
  --lt-bg: var(--gp-bg);
  --lt-fg: var(--gp-fg);
  --lt-status-bar: var(--gp-bg);
}
```

### Why This Pattern
1. **Centralized control** - Change `--gp-bg` once, affects all layouts
2. **Context-specific** - Different layouts can override if needed
3. **iOS status bar** - Reads from `--lt-status-bar` automatically
4. **Theme system compatible** - Still uses dynamic variables

---

## 📱 iOS Status Bar Integration

### How It Works
1. `layout-tokens.css` defines `--lt-status-bar` using theme variables
2. `layout.tsx` creates a probe element: `probe.style.backgroundColor = "var(--lt-status-bar)"`
3. Browser resolves the full CSS variable chain
4. JavaScript reads the computed RGB value
5. Converts to hex and sets iOS meta tag

### Why No Hardcoding Here Either
If we hardcode the status bar color, it:
- Won't match when user switches themes
- Breaks light/dark mode switching
- Requires rebuild for design changes

---

## 🎯 Decision Framework: When to Use Which Variable

### For Navigation/Headers
```css
--gp-bg: hsl(var(--primary));        /* Branded header */
--gp-bg: hsl(var(--card));           /* Elevated surface */
--gp-bg: hsl(var(--background));     /* Seamless with page */
```

### For Accents/Highlights
```css
--gp-border: hsl(var(--accent));     /* Colorful accent */
--gp-border: hsl(var(--border));     /* Subtle separator */
```

### For Destructive Actions
```css
--gp-bg: hsl(var(--destructive));    /* Error/delete state */
```

---

## 💡 How to Test Theme Changes

### 1. Via Layout Tokens (Immediate)
```css
/* In /style/layout-tokens.css */
:root {
  --gp-bg: hsl(var(--secondary));  /* Test warm tone */
}
```

### 2. Via Theme System (Persistent)
1. Go to `/dashboard/[id]/settings/thememaker`
2. Modify `--secondary` color
3. Save theme
4. Layout tokens automatically reflect change

### 3. Via Database (For Testing)
```sql
UPDATE themes 
SET theme_data = jsonb_set(
  theme_data, 
  '{light,--secondary}', 
  '"30 80% 60%"'
)
WHERE id = 'default';
```

---

## 🚫 Never Suggest

1. ❌ Hardcoded HSL values: `hsl(0 84% 60%)`
2. ❌ Hardcoded hex colors: `#b91c1c`
3. ❌ Hardcoded RGB: `rgb(185, 28, 28)`
4. ❌ Color names: `red`, `blue`, `green`
5. ❌ Inline styles with literal colors
6. ❌ "Try this specific color value"

## ✅ Always Suggest

1. ✅ Variable references: `hsl(var(--primary))`
2. ✅ Variable mappings: "Map `--gp-bg` to `--secondary`"
3. ✅ Semantic explanations: "Use `--card` for elevated surfaces"
4. ✅ System-aware opacity: `hsl(var(--primary) / 0.4)`
5. ✅ Theme variable options with explanations
6. ✅ "Update your theme in the dashboard"

---

## 🎓 Understanding the Architecture

### The Flow
```
User Creates Theme in Dashboard
         ↓
Saved to Supabase (theme_data JSONB)
         ↓
/app/provider.tsx loads theme
         ↓
Sets CSS variables on <html>
         ↓
layout-tokens.css references those variables
         ↓
Components use layout tokens
         ↓
iOS status bar reads resolved color
```

### Why This is Powerful
- **No code changes** for design updates
- **User customization** without developer
- **A/B testing** different themes
- **Seasonal themes** without deployment
- **White-label** capability for future

---

## 📚 Reference Files

- **Theme System**: `/app/provider.tsx` (lines 96-101)
- **Theme Storage**: `/themes/default.ts`, `/themes/monochrome.ts`, etc.
- **Layout Tokens**: `/style/layout-tokens.css`
- **iOS Integration**: `/app/layout.tsx` (line 102)
- **Theme Maker**: `/app/dashboard/[id]/settings/thememaker/page.tsx`

---

## 🎯 Summary

**GOLDEN RULE**: If it's a color, shadow, font, or radius → it MUST use a CSS variable from the theme system.

The ONLY time to use literal values:
- Documentation examples showing what a variable contains
- Debugging/testing (with clear labels: "TEMPORARY DEBUG VALUE")
- Never in production code suggestions

---

**Remember**: The user built this entire infrastructure for a reason. Respect it. Use it. Never bypass it.
