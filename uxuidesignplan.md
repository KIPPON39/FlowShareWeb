# FlowShare — UX/UI Design Plan
> Last reviewed: 2026-05-20

This document serves as a comprehensive, living product design audit and user experience reference for **FlowShare** (n8n Automation Workflow Sharing Hub). It details the visual language, design token hierarchies, layout systems, page-by-page critiques, cross-page inconsistencies, and a strategic priority roadmap to align the visual premium style with high-end architectural engineering.

---

## SECTION 1 — Website Analysis

Before critique, a holistic audit of the core product definition, style decisions, and semantic foundation is vital to ensure all styling revisions respect and elevate the existing design language.

### 1.1 Product Summary
*   **What is this product?**: FlowShare is a premium, community-driven automation workflow sharing platform tailored for discovering, uploading, testing, and sharing automation pipeline configurations (specifically n8n templates). The platform automatically parses pasted JSON code to extract workflows, steps, dynamic tags, and required node connections, displaying them visually.
*   **Target User**: Automation engineers, indie hackers, DevOps specialists, operations managers, and developers seeking to optimize their systems by utilizing pre-built, robust pipeline blueprints.
*   **Core User Journey**:
    1.  **Browse & Discover**: Filter templates dynamically by tech stack or category (e.g., AI Automation, DevOps, Sales).
    2.  **Inspect & Deep-dive**: Review step timelines, technical specs, security requirements, and JSON parameters.
    3.  **Execute & Contribute**: Download/request workflow files, invite contributors, or paste JSON templates to publish new automation flows.

### 1.2 Design Language
*   **Overall Visual Style**: Premium **Futuristic Dark Glassmorphism**. The UI utilizes rich dark background layers, fine semitransparent borders, glow-based mouse spotlight tracking, radial ambient neon gradients, and technical grid backdrops to evoke the aesthetic of a state-of-the-art developer terminal.
*   **Mood/Feeling**: High-end, precise, sophisticated, and highly efficient. The contrast between deep background fills and warm orange accents (`#a73b24`) feels energetic yet professional.
*   **Consistency**: Extremely consistent theme. Light and dark modes are driven entirely by custom CSS properties mapped through Tailwind, ensuring uniform transitions across interactive states.

### 1.3 Color System Audit

The following colors are observed in the system variables and layouts:

| Role | Hex (estimate) | Used for | Consistent? |
| :--- | :--- | :--- | :--- |
| **Primary (Accent)** | `#a73b24` | Primary CTAs, active highlights, cursor spotlights, tag outlines | **Yes** |
| **Background (Dark)** | `#09090b` | Global screen background for dark theme | **Yes** |
| **Background (Light)**| `#fafafa` | Global screen background for light theme | **Yes** |
| **Surface (Dark)** | `#111113` | Component cards, code blocks, sidebar containers, modal bodies | **Yes** |
| **Surface (Light)** | `#ffffff` | Component cards, search fields, modal bodies in light theme | **Yes** |
| **Surface Alt (Dark)**| `#1a1a1e` | Alternating rows, input backgrounds, dark badges | **Yes** |
| **Text Primary (Dark)**| `#f0f0f3` | Primary headers, strong card titles, focus copy | **Yes** |
| **Text Primary (Light)**| `#111111` | Primary headers, strong titles in light theme | **Yes** |
| **Text Secondary** | `#dcdce0` (dark)<br>`#333333` (light) | Body copy, section explanations, sub-titles | **Yes** |
| **Muted** | `#b8b8c0` (dark)<br>`#666666` (light) | Secondary descriptions, author labels, timestamp states | **Yes** |
| **Border** | `rgba(255,255,255,0.11)` (dark)<br>`rgba(0,0,0,0.06)` (light) | Standard card outlines, form grid dividers, panel borders | **Yes** |
| **Border Strong** | `rgba(255,255,255,0.18)` (dark)<br>`rgba(0,0,0,0.10)` (light) | Focus inputs, elevated card hover lines, active borders | **Yes** |
| **Success** | `#10b981` | Progress checklist milestones, successful download cues | **Yes** |
| **Error** | `#ef4444` | Required field validation tags, missing data indicator limits | **Yes** |
| **Warning** | `#f59e0b` | Moderate warning flags, missing non-critical parameters | **Yes** |

> [!NOTE]
> **Rogue Colors**: Small hardcoded background colors such as `bg-[#FAECE7]` and light form borders exist in inline Tailwind blocks in `upload-section.tsx`. They should be refactored to use semantic `--accent-soft` variables.
>
> **Contrast Check**: Colors universally pass WCAG AA (4.5:1) except for smaller secondary labels using `--muted-light` (`#76767f`) on dark surfaces. High-priority text sizes should be bumped to standard dark variables to ensure readability.

### 1.4 Typography Audit

| Style | Font | Size | Weight | Usage | Consistent? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title (Desktop)** | Kanit, sans-serif | `3.5rem` (56px) | `800` (Extra Bold) | Landing main hero tagline | **Yes** |
| **Hero Title (Mobile)** | Kanit, sans-serif | `2.0rem` (32px) | `800` (Extra Bold) | Landing hero on smaller displays | **Yes** |
| **Section Heading (H2)** | Kanit, sans-serif | `1.75rem` (28px) | `600` (Semibold) | Browse titles, primary divisions | **Yes** |
| **Subsection H3** | Kanit, sans-serif | `1.15rem` (18.4px) | `600` (Semibold) | Cards titles, filter segments | **Yes** |
| **Body (Normal)** | Kanit, sans-serif | `0.875rem` (14px) | `400` (Regular) | Description blocks, paragraphs | **Yes** |
| **Caption / Label** | Kanit, sans-serif | `0.75rem` (12px) | `500` (Medium) | Meta-tags, author credits, helper tips | **Yes** |
| **Button Text** | Kanit, sans-serif | `0.875rem` (14px) | `600` (Semibold) | Primary actions, submit headers | **Yes** |

> [!TIP]
> **Type Scale Evaluation**: Sizing jumps are highly logical, scaling in clean intervals. Font weights are structured consistently (Headers `600/800`, Labels `500`, Body `400`). Line-height relies heavily on standard dynamic `leading-relaxed` (approx 1.5x font size), keeping readability high on narrow screens.

### 1.5 Spacing & Layout System
*   **Grid Alignment**: The design adheres to a strict 4px/8px incremental grid. Card grids use standard `gap-6` (24px) or `gap-8` (32px) configurations.
*   **Padding & Margins**: Container blocks are standard across pages (using `px-4 sm:px-6 lg:px-8` standard layout gutters).
*   **Component Sizing**: Standard form inputs maintain a uniform height of `44px` (`h-11`) or `40px` (`h-10`) with consistent `--radius-lg` (12px) or `--radius-xl` (16px) corners.

---

## SECTION 2 — Page-by-Page UX/UI Audit

### Page: Landing Page (`/` | `app/page.tsx` & `components/hero.tsx`)

#### What is working well
*   **Stunning Interactive Grid**: The combination of static glowing gradients and rotating three-dimensional perspectives creates an immersive, premium environment.
*   **Spotlight Mouse Tracking**: The dynamic mouse coordinate trackers (`--mouse-x`, `--mouse-y`) on feature cards feel extremely high-end and responsive.
*   **High-Fidelity Transitions**: Micro-interactions like the sweep borders (`.futuristic-hover`) add smooth visual feedback without introducing performance lag.

#### Issues found

| # | Issue | Severity | Affected Users | Suggested Fix |
|---|---|---|---|---|
| 1 | **3D Carousel Overflow & Clipping**<br>Absolute coordinate mappings (`-280%` to `280%`) push hero slides outside the viewport boundaries on small screens, causing horizontal breaks. | 🔴 **Critical** | Mobile & Tablet Users | detect narrow screens using `useIsMobile`. On screen sizes below 768px, collapse absolute transformations. Transition to a touch-swipeable single card component displaying standard horizontal overflow clues. |
| 2 | **Hidden Swipe Context on Horizontal List**<br>Horizontal scroll on stats/flows lists hides standard scrollbars completely (`.scrollbar-hide`) and hides direction arrows on mobile. | 🔴 **Critical** | Mobile & Touch Visitors | Adjust card sizes so the rightmost card is truncated (cut off by ~20px) to indicate swipeable content. Add visual pagination indicator dots under scroll containers. |
| 3 | **Backwards Auto-Advance Direction**<br>In `hero.tsx`, the auto-slide interval calls `goPrev` instead of `goNext`, causing slides to advance from left to right which feels backward to read. | 🟡 **Important** | All Visitors | Swap interval function hooks inside `useEffect` from `goPrev` to `goNext` to follow standard chronological reading patterns. |
| 4 | **Vague Category Multi-Select Behavior**<br>Filter category bars permit multiple active categories but look like single-choice tabs without dynamic count markers or checkboxes. | 🟡 **Important** | Search & Discovery Explorers | Integrate tiny check indicator states inside tags or enforce standard single-select tabs where selecting a new category clears the prior selection. |

#### Color & typography issues on this page
*   The STAT panels contain minor raw border colors instead of references to the standard theme variables. Ensure they use `--border`.

---

### Page: Explore & Browse Page (`/flows` | `app/flows/page.tsx`)

#### What is working well
*   **Polished Search Focus State**: The custom `.search-glow` class provides a beautiful, rotating gradient border when users focus the search bar.
*   **Clear Statistics**: Dynamic counters for matching workflows keep the catalog easy to parse.

#### Issues found

| # | Issue | Severity | Affected Users | Suggested Fix |
|---|---|---|---|---|
| 1 | **Mobile Screen Overcrowding**<br>The search bar, categories list, item counter, and sorting dropdown all stack vertically on mobile, pushing the actual catalog listings completely below the fold. | 🔴 **Critical** | Mobile Screen Users | Group all sorting options, filter sets, and advanced tag selectors into a collapsible layout or bottom-sheet drawer triggered by a single "Filters" action button. |
| 2 | **Desktop Auto-Focus Hijacking**<br>The search input focuses on mount via JavaScript, which triggers mobile keyboards immediately and disrupts layout anchors. | 🟡 **Important** | Mobile & Accessibility Navigators | Remove `searchInputRef.current?.focus()` calls on page initialization. Allow users to read and scroll the header section naturally first. |
| 3 | **DOM Grid Overhead (No Limit Pagination)**<br>Mapping all returned workflow cards immediately into the grid creates long scroll lengths and massive initial DOM burdens. | 🟡 **Important** | Low-Spec Device Users | Implement a client-side chunk loader displaying 6 or 12 items initially, and use a premium "Load More" button to append new entries dynamically. |

#### Color & typography issues on this page
*   No significant color deviations; search and pagination elements are highly aligned with the core dark variables system.

---

### Page: Upload Page (`/upload` | `app/upload/page.tsx` & `components/upload-section.tsx`)

#### What is working well
*   **Interactive Progress Tracker**: The dynamic completeness ring updates immediately as creators fill out crucial workflow steps.
*   **JSON Meta Parsing**: pasting n8n configurations instantly extracts metadata, dependencies, and title parameters, streamlining the creator experience.

#### Issues found

| # | Issue | Severity | Affected Users | Suggested Fix |
|---|---|---|---|---|
| 1 | **Detached Mobile Validation Checklists**<br>The Live Preview panel and the final "Ship Workflow" buttons live in a sticky sidebar. On mobile viewports, this panel shifts below a long input form, separating inputs from active checklists. | 🔴 **Critical** | Mobile Content Creators | Redesign the layout into a clean multi-step wizard (Step 1: Paste JSON, Step 2: Configure Details, Step 3: Verify & Publish). Render key actions inside a fixed bottom action dock on mobile. |
| 2 | **Unconstrained Mobile Drag Gestures**<br>Swiping on `@dnd-kit` sorting timeline lists on touch devices accidentally initiates drag events, locking vertical scrolling entirely. | 🔴 **Critical** | Mobile Touchscreen Users | Implement strict drag constraints (e.g. require a 250ms press delay before activating, or lock dragging strictly to dedicated drag-handle icons). |
| 3 | **Accidental Contributor Dropouts**<br>Typing a contributor's email requires clicking a plus icon or pressing enter. If the user hits the main form "Ship" action directly, the un-added text is silently discarded. | 🟡 **Important** | Team Collaborators | Auto-parse and append the active text inside the email input field to the verified list upon form submission, preventing user data loss. |
| 4 | **Vague Form Field Error Boundaries**<br>Missing input fields flag requirements inside the bottom checklist, but the actual input fields do not display distinct red outlines or inline helper errors. | 🟡 **Important** | Form Submitters | Apply clear red borders (`border-red-500`), error labels, and inline helpers when validation failures occur. |

#### Color & typography issues on this page
*   The upload panel uses hardcoded background tones (e.g. `bg-[#fcf8f6]`) instead of referencing the standard theme token `--accent-soft`.

---

### Page: Workflow Detail View Page (`/workflow/[id]` | `components/workflow-detail.tsx`)

#### What is working well
*   **Premium Code Block Previews**: Clean collapsible panel designs with syntax highlighting.
*   **Interactive Path Indicators**: Visually mapping dependencies, API parameters, and creators in a technical side widget fits perfectly.

#### Issues found

| # | Issue | Severity | Affected Users | Suggested Fix |
|---|---|---|---|---|
| 1 | **Pipeline Timeline Scroll-Traps**<br>The timeline list has a static height block (`max-h-[500px]`) with inner scrolling. Tapping and swiping inside this box on mobile traps user scrolling. | 🔴 **Critical** | Touch & Mobile Readers | Remove the fixed height and inner scrollbar from the step container. Allow the timeline to expand natively down the length of the page so page scrolling remains unified. |
| 2 | **Modal Virtual Keyboard Squishing**<br>Forms like the download modal use absolute centered layouts. On mobile, when virtual keyboards appear, modals get squished or cropped off. | 🔴 **Critical** | Mobile Form Submitters | Wrap inner modal elements in a scrollable container (`overflow-y-auto`) and set the main wrapper to dynamic viewports height (`max-h-[85vh]`). |
| 3 | **Abrupt Content Height Reflows**<br>Expanding a long brief description shifts all underlying content downward abruptly. | 🟡 **Important** | Desktop & Mobile Readers | Use Framer Motion's `<motion.div layout />` wrappers to smoothly animate the description height transition. |

#### Color & typography issues on this page
*   The close buttons inside details modal headers deviate slightly in sizing. Standardize header structures.

---

### Global Components (`components/workflow-card.tsx` & Portal Modals)

#### What is working well
*   **Premium Hover Borders**: The animated sweeping glow (`.futuristic-hover`) gives simple cards an incredibly modern look.
*   **Rich Micro-Animations**: Interactive stats and badges transition smoothly on mouse hover.

#### Issues found

| # | Issue | Severity | Affected Users | Suggested Fix |
|---|---|---|---|---|
| 1 | **DOM Portal Bloat**<br>Every mounted card loads its own hidden instances of `DownloadFormModal` and `SpeakerFormModal`. Loading 20 cards mounts 40 hidden modal instances in the DOM. | 🔴 **Critical** | All Users (Performance) | Extract modal controls to a global provider or page-level state. Mount exactly **one** shared instance of each modal at the page root, passing active metadata dynamically on open. |
| 2 | **Hover-Only Meta Tooltips on Mobile**<br>Creator tags display additional hover-only tooltips (`group-hover/creator:opacity-100`). Since hover states do not exist on touch displays, mobile users cannot read creator details. | 🔴 **Critical** | Mobile & Touchscreen Users | Convert hover triggers to standard tap/toggle configurations on mobile screens, or display details in a bottom-drawer sheet. |
| 3 | **Nested Hitbox Nesting Conflicts**<br>Clicking a card navigates the page, but the card contains nested action buttons (like "Download" or "Invite"), leading to double execution. | 🟡 **Important** | Screen Reader & Navigators | Apply `e.stopPropagation()` and `e.preventDefault()` consistently on all inner card action buttons to isolate nested click events. |

---

## SECTION 3 — Design System Inconsistencies (Cross-Page)

The following design system inconsistencies occur across multiple pages and should be addressed for a cohesive UX:

| Component | Inconsistency | Pages Affected | Fix |
| :--- | :--- | :--- | :--- |
| **Category Mappings** | Hardcoded translation lists and filter tags are duplicated. If updated in one file, they break in another. | `app/page.tsx`, `app/flows/page.tsx` | Centralize category configurations inside a shared `lib/workflows.ts` file and import it globally. |
| **Primary Inputs** | Inconsistent border radii and focus glows between explore fields and creator forms. | `/flows`, `/upload`, `/workflow/[id]` | Apply the unified `.focus-ring` classes globally to standardize input styling. |
| **Text Sizing (H1)** | Variations in primary header text sizes and margin structures. | `/flows`, `/workflow/[id]` | Enforce standard Heading 1 scales (desktop `2.5rem`, mobile `2.0rem`) using a unified tailwind helper. |
| **Form Progress Badges** | Inconsistent dynamic translation labels (e.g., `upload.completion_progress` fallback errors). | `/upload`, `/workflow/[id]` | Update language configuration arrays in `lib/i18n.ts` to guarantee translation safety. |

---

## SECTION 4 — Priority Fix Roadmap

To systematically resolve these design system and UX issues, tasks are organized into three strategic implementation sprints:

### Sprint 1 — Must Fix (High Impact / Low-to-Medium Effort)
*Goal: Resolve blocking mobile responsiveness bugs, eliminate performance lags, and fix core interaction traps.*

| Task | Page | Effort | Status |
| :--- | :--- | :--- | :--- |
| **3D Carousel Mobile Swapping**<br>Detect mobile displays dynamically and transition from coordinate spacing grids to flat swipe containers. | Landing Page (`/`) | **Medium** | ✅ **Done** |
| **Mobile Horizon Scroll Hinting**<br>Implement partial cut-off indicators on the stats and flows lists to make swiping intuitive. | Landing Page (`/`) | **Small** | ✅ **Done** |
| **DOM Portal Modal Extraction**<br>Refactor `DownloadFormModal` and `SpeakerFormModal` to load globally at the page root instead of inside every card instance. | Global (`/`, `/flows`) | **Medium** | ⏳ *Planned* |
| **Translation Fallback Correction**<br>Update `lib/i18n.ts` dictionaries to resolve translation gaps on the creator progress indicator. | Creator space (`/upload`)| **Small** | ✅ **Done** |

### Sprint 2 — Should Fix (Medium-to-High Impact / Medium Effort)
*Goal: Remove key interaction hurdles, prevent input data loss, and polish modal forms.*

| Task | Page | Effort | Status |
| :--- | :--- | :--- | :--- |
| **Mobile Modal Layout & Viewport Height**<br>Redesign overlays with `max-h-[85vh]` and inner scroll blocks to prevent squishing when virtual keyboards appear. | Global Modals | **Medium** | ⏳ *Planned* |
| **Timeline Scroll Trap Removal**<br>Remove fixed-height containers (`max-h-[500px]`) from the pipeline timeline to prevent scroll capture on mobile. | Details (`/workflow/[id]`)| **Small** | ⏳ *Planned* |
| **Drag Gesture Press Thresholds**<br>Set strict constraints (e.g., `delay: 250ms`) on `@dnd-kit` elements to prevent interference with mobile page scrolling. | Creator space (`/upload`)| **Medium** | ⏳ *Planned* |
| **Auto-Submit Draft Collaborators**<br>Parse and save active email input contents on form submit, preventing contributor data loss. | Creator space (`/upload`)| **Small** | ⏳ *Planned* |

### Sprint 3 — Polish (Low-to-Medium Impact / Medium-to-Large Effort)
*Goal: Standardize typography, refine transitions, and prepare the database for scale.*

| Task | Page | Effort | Status |
| :--- | :--- | :--- | :--- |
| **Unified Focus Ring Styling**<br>Standardize border-radii and focus rings on all inputs across pages using unified classes. | All Pages | **Small** | ⏳ *Planned* |
| **Smooth Height Reflows**<br>Apply Framer Motion animations to transition descriptions smoothly, preventing layout shifts. | Details (`/workflow/[id]`)| **Medium** | ⏳ *Planned* |
| **Autofocus Initialization Cleanup**<br>Remove the JavaScript search input focus on page mount to prevent visual jumps on mobile load. | Browse (`/flows`) | **Small** | ✅ **Done** |
| **Static Avatar Fail-safes**<br>Integrate local SVG avatar generators as a fallback for the external Dicebear API. | Creator space (`/upload`)| **Medium** | ⏳ *Planned* |

---

## SECTION 5 — Design Tokens Recommendation

To maintain design consistency as FlowShare scales, the following design tokens are recommended for global configuration:

```json
{
  "color": {
    "primary": "#a73b24",
    "background": {
      "light": "#fafafa",
      "dark": "#09090b"
    },
    "surface": {
      "light": "#ffffff",
      "dark": "#111113",
      "alt-light": "#f8f8f8",
      "alt-dark": "#1a1a1e"
    },
    "text": {
      "primary-light": "#111111",
      "primary-dark": "#f0f0f3",
      "secondary-light": "#333333",
      "secondary-dark": "#dcdce0",
      "muted-light": "#666666",
      "muted-dark": "#b8b8c0"
    },
    "border": {
      "light": "rgba(0, 0, 0, 0.06)",
      "dark": "rgba(255, 255, 255, 0.11)",
      "strong-light": "rgba(0, 0, 0, 0.10)",
      "strong-dark": "rgba(255, 255, 255, 0.18)"
    },
    "accent": {
      "accent-glow-light": "rgba(167, 59, 36, 0.12)",
      "accent-glow-dark": "rgba(167, 59, 36, 0.25)",
      "accent-soft-light": "rgba(167, 59, 36, 0.04)",
      "accent-soft-dark": "rgba(167, 59, 36, 0.12)"
    },
    "semantic": {
      "success": "#10b981",
      "error": "#ef4444",
      "warning": "#f59e0b"
    }
  },
  "typography": {
    "font-family": "\"Kanit\", sans-serif",
    "headings": {
      "hero": {
        "size-desktop": "3.5rem",
        "size-mobile": "2.0rem",
        "weight": "800"
      },
      "h2": {
        "size": "1.75rem",
        "weight": "600"
      },
      "h3": {
        "size": "1.15rem",
        "weight": "600"
      }
    },
    "body": {
      "size": "0.875rem",
      "weight": "400",
      "line-height": "1.5"
    },
    "caption": {
      "size": "0.75rem",
      "weight": "500"
    },
    "button": {
      "size": "0.875rem",
      "weight": "600"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px"
  },
  "radius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "2xl": "20px",
    "pill": "9999px"
  }
}
```
