# Gypsym Design System (GDS)
## Enterprise Visual Design System & Component Architecture

---

| Document Metadata | Value |
| :--- | :--- |
| **System Version** | 1.0.0-GDS-SPEC |
| **Status** | Approved Design System Specification |
| **Architect** | Principal Design Systems Architect |
| **Foundational Standards** | [PRD.md](file:///e:/dev/gypsym-advance-site/PRD.md), [HLD.md](file:///e:/dev/gypsym-advance-site/HLD.md), [LLD.md](file:///e:/dev/gypsym-advance-site/LLD.md) |
| **Core Technology** | Next.js 14+, Tailwind CSS 3+, shadcn/ui (Radix UI), Class Variance Authority (CVA) |
| **Date** | September 2026 |

---

## 1. Design Principles

The Gypsym Design System (GDS) establishes a unified visual and interactive language engineered to convey **enterprise technology, institutional trust, engineering precision, and global stature**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CORE DESIGN SYSTEM PRINCIPLES                         │
├───────────────────────┬─────────────────────────┬───────────────────────────┤
│ 1. Radical Precision  │ 2. Luminous Restraint   │ 3. Sovereign Adaptability │
│    & Purpose          │    (Aesthetic Depth)    │    (Zero-Hardcode Tokens) │
├───────────────────────┼─────────────────────────┼───────────────────────────┤
│ Every pixel, border,  │ Subtle depth created    │ All colors, radii, and    │
│ and spacing unit is   │ through layered slate   │ typography are driven by  │
│ mapped to an 8px grid surfaces, fine borders,   │ centralized CSS variables │
│ with deliberate focus │ and restrained luminous │ dynamically re-themed by  │
│ on content hierarchy. │ accent glows.           │ the CMS admin at runtime. │
└───────────────────────┴─────────────────────────┴───────────────────────────┘
```

1. **Engineering Precision:** Layouts feature crisp geometric borders, calibrated optical alignments, and exact monospace telemetry where technical metrics are presented.
2. **Institutional Authority:** Visual hierarchies prioritize readability, high contrast, and uncluttered negative space over gratuitous decorative flourishes.
3. **Restrained Dynamism:** Micro-interactions and motion are purposeful—confirming user actions, easing state transitions, and guiding spatial awareness without degrading performance.
4. **Theme Sovereignty:** The system operates without hardcoded color hex values across UI components. All visual attributes reference semantic CSS tokens (`--primary`, `--surface-1`, `--border`) that can be overridden dynamically by administrative branding settings.

---

## 2. Color System & Semantic Architecture

GDS uses a **Three-Tier Token Architecture**:
* **Tier 1 (Primitive HSL Scale):** Raw color spectrum values.
* **Tier 2 (Semantic Tokens):** Functional roles (`--background`, `--foreground`, `--primary`, `--muted`).
* **Tier 3 (Component Tokens):** Applied tokens (`--btn-primary-bg`, `--card-border`).

### 2.1 CSS Variables Token Sheet (`globals.css`)

```css
@layer base {
  :root {
    /* -------------------------------------------------------------
       DAYLIGHT THEME (Light Mode)
       ------------------------------------------------------------- */
    --background: 210 40% 98%;           /* Clean frosted porcelain #F8FAFC */
    --foreground: 222 47% 11%;           /* Deep navy-charcoal #0F172A */

    --card: 0 0% 100%;                   /* Pure white #FFFFFF */
    --card-foreground: 222 47% 11%;

    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    /* Brand Primary (Configurable via Admin: default Electric Cobalt) */
    --primary: 217 91% 60%;              /* #3B82F6 */
    --primary-foreground: 210 40% 98%;

    /* Brand Secondary */
    --secondary: 210 40% 96.1%;          /* #F1F5F9 */
    --secondary-foreground: 222 47% 11%;

    /* Muted & Subdued */
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%; /* #64748B */

    /* Accent & Hover */
    --accent: 210 40% 94%;
    --accent-foreground: 222 47% 11%;

    /* Semantic States */
    --destructive: 0 84.2% 60.2%;        /* Crimson #EF4444 */
    --destructive-foreground: 210 40% 98%;

    --success: 151 65% 42%;              /* Emerald #10B981 */
    --success-foreground: 0 0% 100%;

    --warning: 38 92% 50%;               /* Amber #F59E0B */
    --warning-foreground: 222 47% 11%;

    /* Structural Boundaries */
    --border: 214.3 31.8% 91.4%;         /* Soft Slate #E2E8F0 */
    --input: 214.3 31.8% 91.4%;
    --ring: 217 91% 60%;

    --radius: 0.5rem;                    /* 8px Base Radius */

    /* Surfaces & Elevation */
    --surface-glass: 0 0% 100% / 0.8;
    --surface-border: 214.3 31.8% 91.4% / 0.6;
  }

  .dark {
    /* -------------------------------------------------------------
       ENTERPRISE OBSIDIAN THEME (Dark Mode - Default)
       ------------------------------------------------------------- */
    --background: 224 71% 4%;            /* Deep Cosmic Obsidian #030712 */
    --foreground: 210 40% 98%;           /* High-contrast Chalk #F8FAFC */

    --card: 222 47% 7%;                  /* Deep Slate Surface #090E1A */
    --card-foreground: 210 40% 98%;

    --popover: 222 47% 7%;
    --popover-foreground: 210 40% 98%;

    /* Brand Primary (Configurable via Admin) */
    --primary: 217 91% 60%;              /* Electric Cobalt */
    --primary-foreground: 224 71% 4%;

    /* Brand Secondary */
    --secondary: 217.2 32.6% 12%;        /* Elevated Slate #131D2E */
    --secondary-foreground: 210 40% 98%;

    /* Muted & Subdued */
    --muted: 217.2 32.6% 12%;
    --muted-foreground: 215 20.2% 65.1%; /* #94A3B8 */

    /* Accent & Hover */
    --accent: 217.2 32.6% 15%;
    --accent-foreground: 210 40% 98%;

    /* Semantic States */
    --destructive: 0 62.8% 50.6%;
    --destructive-foreground: 210 40% 98%;

    --success: 151 65% 42%;
    --success-foreground: 224 71% 4%;

    --warning: 38 92% 50%;
    --warning-foreground: 224 71% 4%;

    /* Structural Boundaries */
    --border: 217.2 32.6% 14%;           /* Clean 1px border #162032 */
    --input: 217.2 32.6% 14%;
    --ring: 217 91% 60%;

    /* Surfaces & Elevation */
    --surface-glass: 222 47% 7% / 0.85;
    --surface-border: 217.2 32.6% 20% / 0.6;
  }
}
```

---

## 3. Typography & Modular Font Scale

* **Primary Sans:** `Inter` (or `Geist Sans`) via `next/font/google` for UI elements, headings, and body copy.
* **Technical Monospace:** `JetBrains Mono` for code blocks, metrics, tags, and system telemetry.
* **Modular Ratio:** Major Third (`1.250`).

### 3.1 Typographic Scale

| Token | Class | Size (rem / px) | Line Height | Letter Spacing | Font Weight | Semantic Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `text-display-2xl`| `text-6xl md:text-7xl` | `4.5rem (72px)` | `1.05` | `-0.035em` | Bold (700) | Homepage Hero Headline |
| `text-display-xl` | `text-5xl md:text-6xl` | `3.75rem (60px)`| `1.10` | `-0.030em` | Bold (700) | Primary Landing Page H1 |
| `text-display-lg` | `text-4xl md:text-5xl` | `3.0rem (48px)`  | `1.15` | `-0.025em` | SemiBold (600)| Major Section H2 |
| `text-title-xl`   | `text-3xl md:text-4xl` | `2.25rem (36px)` | `1.25` | `-0.020em` | SemiBold (600)| Sub-section H3 |
| `text-title-lg`   | `text-2xl`             | `1.5rem (24px)`  | `1.30` | `-0.015em` | SemiBold (600)| Card Titles, Feature Headings |
| `text-title-md`   | `text-xl`              | `1.25rem (20px)` | `1.40` | `-0.010em` | Medium (500)  | Modals, Navigation Headers |
| `text-body-lg`    | `text-lg`              | `1.125rem (18px)`| `1.60` | `-0.005em` | Regular (400) | Hero Subtitles, Lead Paragraphs|
| `text-body-md`    | `text-base`            | `1.0rem (16px)`  | `1.60` | `0em`      | Regular (400) | Standard Body Copy, Forms |
| `text-body-sm`    | `text-sm`              | `0.875rem (14px)`| `1.50` | `0.005em`  | Regular / Med | Table Rows, Secondary Metadata |
| `text-caption`    | `text-xs`              | `0.75rem (12px)` | `1.40` | `0.020em`  | Medium (500)  | Badges, Footnotes, Eyebrow Tags|

---

## 4. Spacing Scale, Container & Grid Systems

### 4.1 Spacing Tokens (4px / 8px Baseline)

```
0   = 0px         1   = 4px         2   = 8px         3   = 12px
4   = 16px        5   = 20px        6   = 24px        8   = 32px
10  = 40px        12  = 48px        16  = 64px        20  = 80px
24  = 96px        32  = 128px       40  = 160px
```

### 4.2 Container System
* **`container-sm`:** `640px` (Compact auth dialogs, narrow reading views).
* **`container-md`:** `768px` (Technical blog articles, legal documentation).
* **`container-lg`:** `1024px` (Service deep dives, multi-step wizards).
* **`container-xl`:** `1280px` (Standard corporate content width).
* **`container-2xl`:** `1440px` (Enterprise full-width dashboards, mega-grid hero layouts).
* **Horizontal Gutters:** `px-4 sm:px-6 lg:px-8`.

### 4.3 12-Column Responsive Grid
* `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (Standard Feature & Card Grids).
* `grid-cols-1 lg:grid-cols-12 gap-8` (Asymmetric layout: 8-col content + 4-col sticky sidebar).

---

## 5. Border Radius, Shadows & Elevation

### 5.1 Border Radius
* `rounded-none`: `0px` (Strict technical borders).
* `rounded-sm`: `calc(var(--radius) - 4px)` (4px) (Badges, small tags, tooltips).
* `rounded-md`: `calc(var(--radius) - 2px)` (6px) (Input fields, buttons, dropdown items).
* `rounded-lg`: `var(--radius)` (8px) (Cards, modals, popovers, section containers).
* `rounded-xl`: `calc(var(--radius) + 4px)` (12px) (Feature showcase panels, hero cards).
* `rounded-full`: `9999px` (Avatars, pills, status dots).

### 5.2 Shadows & Elevation Layering

| Elevation Tier | Tailwind Utility | Visual Application |
| :--- | :--- | :--- |
| **Surface 0 (Base)** | `shadow-none` | Root page background (`--background`). |
| **Surface 1 (Card)** | `border border-border bg-card` | Data cards, feature panels with subtle 1px border. |
| **Surface 2 (Hover)** | `shadow-md hover:border-primary/40` | Interactive card hover states with crisp highlight border. |
| **Surface 3 (Flyout)**| `shadow-lg bg-popover/95 backdrop-blur-md` | Dropdowns, mega-menus, combobox popovers. |
| **Surface 4 (Modal)** | `shadow-2xl border border-border/80` | Center dialogs, command palettes (`CMD+K`). |
| **Luminous Accent** | `shadow-[0_0_50px_-12px_hsl(var(--primary)/0.25)]` | Subtle ambient background glow behind hero headlines and CTAs. |

---

## 6. Iconography, Motion & Accessibility

### 6.1 Iconography Standards (Lucide React)
* **Default Icon Size:** `16px` (`w-4 h-4`) inside buttons and compact rows; `20px` (`w-5 h-5`) in navigation; `24px` (`w-6 h-6`) in feature card headers.
* **Stroke Width:** Uniform `1.75px` stroke across all Lucide icons to maintain optical parity.
* **Decorative Icons:** Always decorated with `aria-hidden="true"`.

### 6.2 Motion Tokens & Animation Principles
* **Timing Durations:**
  * `duration-fast`: `120ms` (Buttons, micro-interactions, tooltips).
  * `duration-normal`: `200ms` (Flyout drawers, dropdown expands).
  * `duration-slow`: `350ms` (Modal overlays, page view transitions).
* **Easing Function:** `cubic-bezier(0.16, 1, 0.3, 1)` (Fluid enterprise ease-out).
* **Accessibility (Reduced Motion):**
  * All CSS and Framer Motion transitions wrapped in `@media (prefers-reduced-motion: reduce)`.
  * Smooth scrolls and parallax automatically neutralized for users with vestibular sensitivities.

### 6.3 Accessibility & Focus Discipline
* **Focus Rings:** Visible, high-contrast focus rings: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`.
* **Color Contrast:** All text tokens guarantee `>= 4.5:1` contrast ratio against their respective surface tokens in both Light and Dark modes.

---

## 7. Reusable Component Catalog (CVA Specifications)

Every component below is engineered using **Class Variance Authority (CVA)**, ensuring consistent states (default, hover, focus, active, disabled, loading) and zero hardcoded colors.

---

### 7.1 Action & Navigation Components

#### 1. `Button`
```typescript
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base font-semibold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

#### 2. `Link`
* **Variants:** `default` (standard text link with animated underline on hover), `subtle` (muted text transitioning to foreground), `brand` (primary color bold).

#### 3. `Badge`
```typescript
export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground',
        success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500',
        warning: 'border-amber-500/20 bg-amber-500/10 text-amber-500',
        destructive: 'border-destructive/20 bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
```

#### 4. `Breadcrumb`
* **Structure:** `<nav aria-label="Breadcrumb">` with ordered list `<ol>`, chevron dividers, accessible current-page marker (`aria-current="page"`).

#### 5. `Tabs` & `Accordion`
* **Tabs:** Radix UI primitive with sliding active pill indicator, keyboard arrow switching (`Tab`, `ArrowRight`, `ArrowLeft`).
* **Accordion:** Collapsible trigger with smooth 180° chevron rotation and height animation (`data-[state=open]:animate-accordion-down`).

---

### 7.2 Structural & Layout Components

#### 6. `Container` & `Section`
* **`Section`:** `<section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">`
* **`Container`:** `<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">`

#### 7. `Card`
```typescript
export const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm transition-all',
  {
    variants: {
      variant: {
        default: 'border-border',
        interactive: 'border-border hover:border-primary/40 hover:shadow-md cursor-pointer',
        elevated: 'border-border/80 bg-secondary/40 backdrop-blur-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
```

#### 8. `Heading`
* **Component:** Dynamically renders `h1`, `h2`, `h3`, `h4` with appropriate typographic scale class tokens.

---

### 7.3 Feedback & Overlay Components

#### 9. `Dialog` (Modal) & `Drawer` (Sheet)
* **Dialog:** Fixed backdrop (`bg-background/80 backdrop-blur-sm`), centered card with entry scale animation (`animate-in fade-in-0 zoom-in-95`).
* **Drawer:** Slide-out from right (`data-[state=open]:slide-in-from-right`), fixed `w-full sm:max-w-lg md:max-w-2xl` for deep inspectors.

#### 10. `Dropdown`, `Combobox`, & `Tooltip`
* Powered by `@radix-ui/react-dropdown-menu` and `@radix-ui/react-tooltip`.
* Includes floating arrow indicators, keyboard navigation, and auto-placement flip algorithms.

#### 11. `Toast` & `Alert`
* **Toast:** Non-blocking notification stack (`sonner` or Radix Toast) positioned bottom-right with progress bar and undo trigger.
* **Alert:** Inline callout with icon, title, and description (Variants: `info`, `success`, `warning`, `destructive`).

---

### 7.4 Form & Data Inputs

#### 12. `Input`, `Textarea`, & `Select`
```typescript
export const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);
```

#### 13. `Table` & `Pagination`
* **Table:** Semantic `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` with sticky headers, subtle row borders, and hover row highlighting.
* **Pagination:** Previous/Next buttons, active page indicators, and page size selector.

---

### 7.5 Enterprise Marketing Showcase Components

#### 14. `Navbar` (Header)
* **Features:** Transparent on top of page, transitions to frosted glass (`bg-background/80 backdrop-blur-md border-b border-border/60`) on scroll. Includes logo, multi-column mega-menus, search trigger (`CMD+K`), dark mode toggle, and primary CTA.

#### 15. `Footer`
* **Features:** Multi-column link lists, corporate legal line, compliance badges (ISO 27001, SOC 2), social links array, and newsletter signup.

#### 16. `Hero`
* **Features:** Eyebrow badge tag, Display-2XL headline, Lead subtitle, Dual CTAs (Primary + Secondary Outline), and subtle background luminous radial gradient (`hsl(var(--primary) / 0.15)`).

#### 17. `CTA Banner`
* **Features:** High-impact call-to-action panel with deep gradient border, headline, description, and direct consultation scheduling button.

#### 18. `Stats Banner`
* **Features:** Responsive 4-column metric showcase with bold large numbers (`text-5xl font-bold font-mono tracking-tight`), label, and supporting description.

#### 19. `Logo Cloud`
* **Features:** Infinite auto-scroll marquee of verified client and partner logos with greyscale filter transitioning to full contrast on hover.

#### 20. `Testimonial Card`
* **Features:** Card with verified client quote, 5-star rating display, author name, executive title, company badge, and author avatar image.

#### 21. `Case Study Card`
* **Features:** High-resolution cover media, client logo chip, transformation headline, summary paragraph, highlighted metric pill (e.g., `+320% Throughput`), and arrow hover transition.

#### 22. `Blog Card`
* **Features:** 16:9 featured cover image, primary category badge, title with hover color transition, excerpt text, author avatar with name, publish date, and read time badge.

---

## 8. Tailwind CSS Configuration Extension (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0%)' },
          to: { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        marquee: 'marquee 35s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};

export default config;
```

---

## 9. Conclusion & Design Sign-Off

The Gypsym Design System (GDS) establishes a complete visual and technical foundation for both the public web platform and enterprise administration portal. Built upon strict CSS token variables and Class Variance Authority (CVA), it allows real-time administrative brand reconfiguration without source code modification while maintaining world-class aesthetics, accessibility, and performance.

---
*End of Gypsym Design System Specification.*
