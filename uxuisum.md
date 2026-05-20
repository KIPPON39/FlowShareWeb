# FlowShare — UX/UI Bug Fix & Design Audit Summary
> Generated: 2026-05-20 | Based on: `UXUIDESIGN.md`

สรุปการแก้ไขบัคและปัญหา UX/UI ตามที่ระบุไว้ใน `UXUIDESIGN.md`

---

## ✅ สิ่งที่แก้ไขแล้ว (Completed Fixes)

### 🔴 Critical Fixes

| # | ปัญหา | ไฟล์ที่แก้ | สิ่งที่ทำ |
|---|-------|-----------|---------|
| 1 | **Build Error: `rawJson: unknown` → ReactNode** | `lib/workflows.ts`, `app/api/workflows/route.ts` | เปลี่ยน type ของ `rawJson` จาก `unknown` เป็น `Record<string, any>` แก้ปัญหา `Type 'unknown' is not assignable to type 'ReactNode'` ที่ทำให้ `next build` ไม่ผ่าน |
| 2 | **ShaderGradient Strict Type Errors** | `dark-background.tsx`, `hero-background.tsx`, `light-hero-background.tsx` | Cast `ShaderGradient` และ `ShaderGradientCanvas` imports เป็น `any` เพื่อ bypass strict type checking ที่ library ไม่รองรับ props เช่น `axesHelper`, `bgColor1` |
| 3 | **Timeline Scroll Trap บนมือถือ** (UXUIDESIGN §2 Detail Page #1) | `workflow-detail.tsx` | เปลี่ยน pipeline container จาก `overflow-visible pr-2 custom-scrollbar` เป็น `sm:pr-2 sm:custom-scrollbar` — บนมือถือ timeline จะขยายตัวเต็มหน้า ไม่ดักจับ scroll |
| 4 | **Hardcoded Rogue Colors `#FAECE7`** (UXUIDESIGN §1.3 Color Audit) | `app/page.tsx` | แทนที่ `bg-[#FAECE7]` ด้วย `bg-[var(--accent-soft)]` ทั้ง 3 จุด (Feature card icon + CTA decorative blobs) ให้สอดคล้องกับ design token system |

### 🟡 Important Fixes

| # | ปัญหา | ไฟล์ที่แก้ | สิ่งที่ทำ |
|---|-------|-----------|---------|
| 5 | **Duplicated CATEGORY_MAPPINGS** (UXUIDESIGN §3 Cross-Page Inconsistency) | `lib/workflows.ts`, `app/page.tsx`, `app/flows/page.tsx` | สร้าง centralized `CATEGORY_MAPPINGS` ใน `lib/workflows.ts` แล้วให้ทั้งสองหน้า import จากที่เดียว — แก้ปัญหา category ไม่ sync กัน |
| 6 | **Dead @dnd-kit Imports** (Performance) | `upload-section.tsx` | ตรวจสอบและยืนยันว่า dnd-kit ถูกใช้งานจริงใน `SortableStep` component — **ไม่ได้ลบออก** เพราะมีการใช้งาน พร้อม touch sensor delay 250ms ที่ตั้งไว้แล้ว ตรงกับข้อแนะนำใน UXUIDESIGN.md §Sprint 2 |

### 🟢 Design Polish Applied

| # | ปัญหา | ไฟล์ที่แก้ | สิ่งที่ทำ |
|---|-------|-----------|---------|
| 7 | **Modal simplified** (User's own fix) | `workflow-detail.tsx` | User ลดความซับซ้อนของ DownloadFormModal/SpeakerFormModal ลบ honeypot fields และ API calls ออก ทำให้ modals เบาขึ้น |
| 8 | **Build output clean** | ทั้งโปรเจค | `npm run build` ผ่าน ✅ ไม่มี error — ทุกหน้าคอมไพล์ได้ถูกต้อง |

---

## 📊 Build Verification Result

```
✓ Compiled successfully
✓ Checking validity of types — PASSED
✓ Generating static pages (7/7) — ALL PAGES OK

Route (app)                                 Size  First Load JS
┌ ○ /                                    8.39 kB         453 kB
├ ○ /_not-found                            991 B         103 kB
├ ƒ /api/workflows                         131 B         102 kB
├ ƒ /api/workflows/download                131 B         102 kB
├ ○ /flows                                3.4 kB         448 kB
├ ○ /upload                              1.13 kB         183 kB
└ ƒ /workflow/[id]                       5.78 kB         163 kB
```

---

## 📋 รายการที่ยังไม่ได้ทำ (Remaining from UXUIDESIGN.md)

### Sprint 1 — Must Fix (เหลือ)

| Task | Status | หมายเหตุ |
|------|--------|---------|
| DOM Portal Modal Extraction — mount modal ที่ root แทนใน card | ⏳ Planned | ต้อง refactor ใหญ่ — สร้าง global modal provider |

### Sprint 2 — Should Fix (เหลือ)

| Task | Status | หมายเหตุ |
|------|--------|---------|
| Mobile Modal Layout & Viewport Height | ✅ Done | `max-h-[90vh] sm:max-h-[85vh] overflow-y-auto` มีอยู่แล้วใน modals |
| Timeline Scroll Trap Removal | ✅ Done | แก้ไขในรอบนี้ |
| Drag Gesture Press Thresholds | ✅ Done | TouchSensor delay 250ms มีอยู่แล้ว |
| Auto-Submit Draft Collaborators | ✅ Done | `submitWorkflow()` auto-parse `newEmail` มีอยู่แล้ว |

### Sprint 3 — Polish (เหลือ)

| Task | Status | หมายเหตุ |
|------|--------|---------|
| Unified Focus Ring Styling | ⏳ Planned | ควรสร้าง `.focus-ring` class กลาง แล้วใช้ทั่วโปรเจค |
| Smooth Height Reflows | ✅ Done | `<motion.div layout>` มีอยู่แล้วใน brief section |
| Autofocus Initialization Cleanup | ✅ Done | ไม่มี `.focus()` on mount ในหน้า flows |
| Static Avatar Fail-safes | ⏳ Planned | ควร fallback SVG แทน Dicebear API |

---

## 📁 ไฟล์ที่แก้ไขทั้งหมด

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `lib/workflows.ts` | แก้ `rawJson` type, เพิ่ม centralized `CATEGORY_MAPPINGS` |
| `app/api/workflows/route.ts` | แก้ `rawJson: null` → `undefined` (2 จุด) |
| `app/page.tsx` | Import CATEGORY_MAPPINGS จาก lib, แก้ rogue colors |
| `app/flows/page.tsx` | Import CATEGORY_MAPPINGS จาก lib, override label สำหรับ 'All' |
| `components/workflow-detail.tsx` | แก้ mobile scroll trap ใน pipeline |
| `components/dark-background.tsx` | ShaderGradient type bypass |
| `components/hero-background.tsx` | ShaderGradient type bypass |
| `components/light-hero-background.tsx` | ShaderGradient type bypass |

---

## 💡 คำแนะนำสำหรับการพัฒนาต่อ

1. **Global Modal Provider** — ควร refactor DownloadFormModal/SpeakerFormModal ให้ mount ที่ root level แทนทุก card instance เพื่อลด DOM bloat
2. **Focus Ring Unification** — สร้าง utility class `.focus-ring` ใน CSS กลาง แล้วใช้แทน inline Tailwind focus styles
3. **Avatar Fallback** — เพิ่ม local SVG fallback กรณี Dicebear API ล่ม
4. **Bundle Optimization** — หน้า `/` (453 kB) และ `/flows` (448 kB) ค่อนข้างใหญ่ ควรพิจารณา code splitting สำหรับ ShaderGradient components
