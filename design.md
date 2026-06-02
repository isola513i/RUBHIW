# Design System: Korean Minimalist Pre-order App

## 1. Core Vibe & Audience

- **Style:** Clean, Warm, Minimalist, "Korean Cafe" aesthetic.
- **Platform:** STRICTLY Mobile-First approach.
- **Business:** Importing Korean goods (Skincare, Makeup, Snacks) via cargo.

## 2. Color Palette (60-30-10 Rule)

- **Primary Background (60%):** `#FDFBF7` (Warm Off-White) - Use for all main backgrounds to maximize white space.
- **Secondary (30%):** `#DDC3A5` (Light Brown / Beige) - Use for UI borders, inactive tabs, footer, and subtle section dividers.
- **Accent/CTA (10%):** `#AEC6CF` (Pastel Blue) - Use STRICTLY for primary Call-to-Action (CTA) buttons, active icons in navigation, and notification badges.
- **Text:** `#4A433B` (Warm Dark Gray) for primary text, `#8C847A` for secondary text. AVOID pure black (`#000000`).

## 3. Typography & Spacing

- **Font:** Modern Sans-Serif (e.g., Inter, Noto Sans Thai). Keep font weights light to medium.
- **Spacing:** Generous padding. Elements should feel airy, not cramped.
- **Border Radius:** `12px` to `16px` for product cards and buttons for a friendly, soft look.
- **Shadows:** Very soft, large blur, low opacity drop shadows (e.g., `box-shadow: 0 4px 20px rgba(74, 67, 59, 0.05)`). No harsh shadows.

## 4. Key UI Components

- **Navigation:** Use a Bottom Navigation Bar instead of a top hamburger menu. Active state icon must be Pastel Blue.
- **Product Categories:** Implement Horizontal Scroll (Carousel) for tabs (All, Skincare, Makeup, Snacks).
- **Product Card:** Must include:
  1. 1:1 ratio image.
  2. Small brand name.
  3. Product name.
  4. Cargo status tag (e.g., "รอของ 15 วัน" or "น้ำหนัก 0.5kg") using Secondary or Accent color background.
  5. Price in THB.
