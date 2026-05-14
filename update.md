# FlowShare UI Changes Summary

## ✅ All 7 Changes Implemented

### 1. Tags Input in Create Flow Form
- Added multi-tag input field below the description in the upload form
- Users can type a tag and press **Enter** or click **+** to add
- Tags display as removable pills with accent styling
- Tags are included in the workflow submission payload

### 2. Dynamic "Flows Live" Count
- Replaced hardcoded `2,847 flows live` with actual count from API
- `Hero` component now accepts `flowCount` prop from parent page
- Displays `{count} flows ที่ใช้งานอยู่` (TH) / `{count} flows live` (EN)

### 3. Static Centered Background Glow
- **Removed** the moving `bg-beam` animation entirely
- Replaced with static centered radial gradients in `bg-glow-static`
- **Light mode**: Brighter centered glow (`opacity 0.18, 0.12, 0.10`)
- **Dark mode**: Even brighter glow (`opacity 0.35, 0.22, 0.18`)
- All gradients centered at `50%` — no animation

### 4. Search Bar Glow Effect
- Added `.search-glow` CSS class with animated gradient border
- Rotating gradient creates a futuristic/sci-fi glow around the search bar
- Glow intensifies on focus (`opacity 0.6` → `1.0`)
- Dark mode has stronger glow effect

### 5. Responsive Improvements
- **Navbar**: Added hamburger menu for mobile (`< 720px`)
- **Hero**: Responsive text sizes (`text-3xl` → `text-[3.5rem]`)
- **Search bar**: Responsive padding and font size
- **Filter tags**: Responsive gap and padding
- **Template grid**: Better mobile spacing
- **Upload form**: Responsive padding and text sizes
- **All pages**: Proper mobile-first breakpoints

### 6. "Ship Flow" Button Removed
- Completely removed from navbar
- Mobile view only shows theme toggle, language toggle, and hamburger menu

### 7. Thai/English Language Toggle
- Default language: **Thai (TH)**
- Toggle button in navbar shows 🇹🇭 TH / 🇬🇧 EN
- Language preference persisted in `localStorage`
- All UI strings across all pages are translated

## Files Modified

| File | Changes |
|------|---------|
| [layout.tsx](file:///e:/InternshipworkFlowshare/FlowShareWeb/app/layout.tsx) | Added I18nProvider, removed bg-beam, Thai font subset |
| [globals.css](file:///e:/InternshipworkFlowshare/FlowShareWeb/app/globals.css) | Static glow, search glow, tag styles, removed beam |
| [page.tsx](file:///e:/InternshipworkFlowshare/FlowShareWeb/app/page.tsx) | Dynamic flow count, i18n, responsive |
| [navbar.tsx](file:///e:/InternshipworkFlowshare/FlowShareWeb/components/navbar.tsx) | Removed Ship Flow, added lang toggle, mobile menu |
| [hero.tsx](file:///e:/InternshipworkFlowshare/FlowShareWeb/components/hero.tsx) | Dynamic count prop, search glow, i18n |
| [upload-section.tsx](file:///e:/InternshipworkFlowshare/FlowShareWeb/components/upload-section.tsx) | Tags input, i18n |
| [workflow-card.tsx](file:///e:/InternshipworkFlowshare/FlowShareWeb/components/workflow-card.tsx) | i18n |
| [workflow-detail.tsx](file:///e:/InternshipworkFlowshare/FlowShareWeb/components/workflow-detail.tsx) | i18n |
| [breadcrumb.tsx](file:///e:/InternshipworkFlowshare/FlowShareWeb/components/breadcrumb.tsx) | i18n |
| [upload/page.tsx](file:///e:/InternshipworkFlowshare/FlowShareWeb/app/upload/page.tsx) | Client component with i18n |
| [workflow/[id]/page.tsx](file:///e:/InternshipworkFlowshare/FlowShareWeb/app/workflow/%5Bid%5D/page.tsx) | Client component with i18n |

## Files Created

| File | Purpose |
|------|---------|
| [i18n.ts](file:///e:/InternshipworkFlowshare/FlowShareWeb/lib/i18n.ts) | Translation context, dictionary (TH/EN) |
| [i18n-provider.tsx](file:///e:/InternshipworkFlowshare/FlowShareWeb/components/i18n-provider.tsx) | React context provider |
| [language-toggle.tsx](file:///e:/InternshipworkFlowshare/FlowShareWeb/components/language-toggle.tsx) | Language switcher button |
