# FlowShare Web — แผนแก้ไข/ปรับปรุงระบบ

> สรุปรวมจากการวิเคราะห์โค้ดทั้งระบบ + ตรวจสอบ Google Sheets จริงจาก `sheetsExample/`
> อัปเดตล่าสุด: 2 มิ.ย. 2026

---

## สถานะระบบปัจจุบัน

| ส่วน | เทคโนโลยี | สถานะ |
|------|-----------|-------|
| Frontend | Next.js (App Router) + React + Framer Motion + Kanit Font | ✅ ใช้งานได้ |
| Auth | JWT Cookie (7 วัน) + bcrypt + n8n Webhook | ✅ ทำงาน (login ด้วย username) |
| User Data | Google Sheets ผ่าน googleapis SDK (Service Account) | ⚠️ Column mapping ผิด |
| Flow Data | Google Sheets ผ่าน n8n Webhook | ✅ ทำงาน |
| Download Requests | n8n Webhook (write) | ⚠️ ไม่มีหน้าดูรายการ |
| Footer | Static links (hardcode) | ⚠️ ไม่ดึงจาก Sheet |
| Admin | ไม่มี | ❌ ต้องสร้างใหม่ |

---

## ผลตรวจสอบ Google Sheets จริง

### 📄 `account_folshare.xlsx` → Sheet tab: `Users`

```
Column A = userid           เช่น FS-USR-20260528-AACE516F
Column B = username          เช่น User02, วิสิฐ พลคชาภรณ์
Column C = email             เช่น user2@gmail.com
Column D = passwordHash      เช่น $2b$10$...
Column E = createdAt         เช่น 2026-05-28T02:27:42.690Z
Column F = image_url         เช่น https://yt3.googleusercontent.com/...
Column G = role              เช่น User, Admin
Column H = speakerInvited    (ว่าง)
Column I = position          (ว่าง)
```

### 📄 `flowshare.xlsx` → 3 Sheet tabs

**Tab: `FlowsList`** (14 columns)
```
A=flowID | B=flowTitle | C=flowDescription | D=flowTags (JSON) |
E=flowKeys (JSON) | F=flowCreators (JSON) | G=flowNodes | H=flowViews |
I=flowDownloads | J=flowSteps (JSON) | K=raw_json | L=json_file_url |
M=created_at | N=updated_at
```

**Tab: `DownloadRequests`** (15 columns)
```
A=dlrequestID | B=flowID | C=requesterName | D=requesterPhone |
E=doc_number | F=date | G=flow_name | H=recipient | I=purpose |
J=signer_name | K=signer_position | L=requesterEmail | M=ownerEmail |
N=status (Pending/Approved/Rejected) | O=timestamp
```

**Tab: `SpeakerRequests`** (22 columns — คำขอเชิญวิทยากร)

---

## สาเหตุบัก: Contributor ไม่แสดง

โค้ดใน `lib/google-sheets.ts` เขียนไว้ผิด 2 จุด:

1. **ชื่อ Sheet ผิด** — โค้ดอ่าน `Sheet1!A:F` แต่ Sheet จริงชื่อ `Users`
2. **Column ไม่ตรง** — โค้ดคิดว่า `A=username, D=email` แต่จริงๆ `A=userid, B=username, C=email`

```
โค้ดคาดว่า:  A=username | B=passwordHash | C=createdAt | D=email | E=imageUrl | F=role
Sheet จริง:  A=userid   | B=username     | C=email     | D=passwordHash | E=createdAt | F=image_url | G=role
```

→ `searchUsers()` อ่าน Column A ได้ `userid` แทน `username` จึงไม่เคย match

---

## รายการงาน 8 ข้อ

### ข้อ 1: 🐛 แก้ Contributor ไม่แสดงในหน้าสร้าง

**ไฟล์ที่ต้องแก้:**
- `lib/google-sheets.ts` — แก้ sheet name `Sheet1` → `Users`, แก้ column index ให้ตรง Sheet จริง
- `app/api/auth/search-users/route.ts` — เพิ่ม error logging ที่ชัดเจน

**สิ่งที่ต้องแก้ใน `google-sheets.ts`:**

| ฟังก์ชัน | range เดิม | range ใหม่ | column ที่ต้องแก้ |
|----------|-----------|-----------|-----------------|
| `getUserByUsername()` | `Sheet1!A:F` | `Users!A:I` | row[0]→userid, row[1]→username, row[2]→email, row[3]→passwordHash, row[5]→imageUrl, row[6]→role |
| `createUser()` | `Sheet1!A:F` | `Users!A:I` | เปลี่ยนลำดับ values ให้ตรง column |
| `searchUsers()` | `Sheet1!A:F` | `Users!A:I` | username=row[1], email=row[2], imageUrl=row[5] |

**ความยาก:** 🟢 ง่าย | **เวลา:** 1–2 ชม.

---

### ข้อ 3: 🔐 Login ด้วย Email แทน Username

**ไฟล์ที่ต้องแก้:**

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `app/login/page.tsx` | input type → email, label → "อีเมล", ส่ง `{ email, password }` |
| `app/api/auth/login/route.ts` | รับ email, เปลี่ยนจาก n8n webhook → ใช้ `getUserByEmail()` จาก google-sheets.ts ตรง |
| `lib/google-sheets.ts` | เพิ่มฟังก์ชัน `getUserByEmail(email)` — ค้นหาจาก Column C |
| `lib/i18n.ts` | อัปเดต label/placeholder สำหรับหน้า login |

**เหตุผลที่เปลี่ยนจาก n8n → API ตรง:** เร็วกว่า, debug ง่ายกว่า, ลด dependency

**ความยาก:** 🟡 ปานกลาง | **เวลา:** 3–4 ชม.

---

### ข้อ 4: 👤 Username เป็นชื่อจริง (Display Name)

เมื่อ email เป็น login identifier แล้ว → username = ชื่อจริง/ชื่อแสดงบนเว็บ

**ไฟล์ที่ต้องแก้:**

| ไฟล์ | การเปลี่ยนแปลง |
|------|---------------|
| `app/register/page.tsx` | label → "ชื่อผู้ใช้ (ชื่อจริง)", เพิ่ม hint "ชื่อนี้จะแสดงบนเว็บ" |
| `app/api/auth/register/route.ts` | ตรวจ unique ด้วย email (ไม่ใช่ username), เปลี่ยนจาก n8n → API ตรง |
| `components/navbar.tsx` | แสดง username (ชื่อจริง) เด่น + email ข้างใต้ |

**Column layout ไม่ต้องเปลี่ยน** — แค่เปลี่ยนความหมาย:
- Column A (username) = ชื่อจริง / Display Name
- Column C (email) = Login Identifier

**ความยาก:** 🟢 ง่าย | **เวลา:** 1–2 ชม.

---

### ข้อ 5: 🔑 ลืมรหัสผ่าน (Optional)

**ไฟล์ใหม่:**
- `app/forgot-password/page.tsx` — form กรอก email ขอ reset
- `app/reset-password/page.tsx` — form กรอกรหัสใหม่ (รับ token จาก URL)
- `app/api/auth/forgot-password/route.ts` — สร้าง JWT reset token → เรียก n8n ส่ง email
- `app/api/auth/reset-password/route.ts` — verify token → อัปเดต passwordHash

**ไฟล์ที่ต้องแก้:**
- `lib/google-sheets.ts` — เพิ่ม `updateUserPassword(email, newHash)`
- `app/login/page.tsx` — เพิ่มลิงก์ "ลืมรหัสผ่าน?"

**ต้องมี:** n8n workflow สำหรับส่ง email (ใช้ pattern เดียวกับ `n8n/speaker-email.html`)

**ความยาก:** 🟡 ปานกลาง | **เวลา:** 4–6 ชม.

---

### ข้อ 6: 🎨 Navbar เพิ่ม "by" + kkulilogo.svg

**ไฟล์ที่ต้องแก้:** `components/navbar.tsx`

**Layout ที่ต้องการ:**
```
[FlowShare Logo] FlowShare
                 by [kkulilogo.svg]
```

ใช้ `next/image` กับ `/kkulilogo.svg` ที่มีอยู่แล้วใน `public/`

**ความยาก:** 🟢 ง่าย | **เวลา:** 30 นาที

---

### ข้อ 7: ⚙️ Admin Panel — Sheet IDs + Social Links + Templates

**ไฟล์ใหม่:**
- `app/admin/page.tsx` — หน้า Admin Settings
  - Section 1: กรอก Sheet IDs (Users, Flows, Social Links) — รวม 3 ช่อง
  - Section 2: Social Media Links (แก้ URL ของแต่ละ platform)
  - Section 3: ดาวน์โหลด Template CSV ของแต่ละ Sheet
- `app/api/admin/settings/route.ts` — GET/POST Sheet IDs
- `app/api/admin/social-links/route.ts` — GET/POST social links จาก Sheet
- `lib/admin-settings.ts` — อ่าน/เขียน `data/settings.json`
- `data/settings.json` — เก็บ Sheet IDs แบบ runtime (ไม่ต้องรีสตาร์ท)
- `public/templates/users-template.csv`
- `public/templates/flows-template.csv`
- `public/templates/social-links-template.csv`

**ไฟล์ที่ต้องแก้:**
- `components/navbar.tsx` — เพิ่มลิงก์ "Admin" (role=Admin)
- `middleware.ts` — เพิ่ม `/admin` ใน protectedPaths + admin role check
- `lib/google-sheets.ts` — อ่าน Sheet ID จาก settings.json (fallback .env)
- `app/page.tsx` (Footer) — ดึง social links จาก API แทน hardcode, แสดงไอคอน social media

**โครงสร้าง Social Links Sheet:**
```
Column A = platform    (github, discord, x, facebook, instagram, line, youtube)
Column B = url          (https://github.com/FlowShare)
Column C = label        (GitHub)
Column D = enabled      (true/false)
```

**ความยาก:** 🔴 ซับซ้อน | **เวลา:** 6–8 ชม.

---

### ข้อ 8: 🔧 แนวทาง Credential + Google Sheets + n8n

**แนวทาง Hybrid (แนะนำ):**

| Operation | วิธี | เหตุผล |
|-----------|------|--------|
| Login (อ่าน user) | Google Sheets API ตรง | เร็ว, ไม่พึ่ง n8n |
| Register (สร้าง user) | Google Sheets API ตรง | เร็ว, ไม่พึ่ง n8n |
| Search Users | Google Sheets API ตรง | แก้ column ให้ตรง |
| List Flows | n8n webhook (เหมือนเดิม) | n8n transform data |
| Save Flow | n8n webhook (เหมือนเดิม) | n8n upload file |
| Download Request (write) | n8n webhook (เหมือนเดิม) | n8n ส่ง email |
| Download Request (read) | Google Sheets API ตรง | ✨ใหม่ — หน้ารอส่ง |
| Social Links | Google Sheets API ตรง | ✨ใหม่ |
| Reset Password | Sheets API (write) + n8n (email) | Hybrid |

**เพิ่มใน `.env`:**
```env
GOOGLE_SHEET_ID_FLOWS=<ID ของ flowshare sheet>
GOOGLE_SHEET_ID_SOCIAL=<ID ของ social links sheet>
```

**Service Account** ต้อง share Editor access ให้ทุก Sheet ที่ใช้

---

## ลำดับการทำงาน

```
1. 🐛 แก้ Contributor bug          → 🟢 1-2 ชม.
2. 🔐 Login ด้วย Email             → 🟡 3-4 ชม.
3. 👤 Username → Display Name      → 🟢 1-2 ชม.
4. 🎨 Navbar + KKU Logo           → 🟢 30 นาที
6. ⚙️ Admin Panel                 → 🔴 6-8 ชม.
7. 🌐 Social Footer จาก Sheet     → 🟡 2-3 ชม.
8. 🔑 ลืมรหัสผ่าน (Optional)      → 🟡 4-6 ชม.
────────────────────────────────────────
   รวม (ไม่รวม Optional)          ≈ 20-26 ชม.
   รวม (รวม Optional)             ≈ 24-32 ชม.
```

---

## สรุปไฟล์ที่เกี่ยวข้อง

### ไฟล์ที่ต้องแก้ (Modify)

| ไฟล์ | เกี่ยวกับข้อ |
|------|------------|
| `lib/google-sheets.ts` | 1, 2, 3, 5, 7 |
| `components/navbar.tsx` | 2, 4, 6, 7 |
| `middleware.ts` | 2, 7 |
| `app/login/page.tsx` | 3, 5 |
| `app/api/auth/login/route.ts` | 3 |
| `app/register/page.tsx` | 4 |
| `app/api/auth/register/route.ts` | 4 |
| `app/page.tsx` (Footer section) | 7 |
| `lib/i18n.ts` | 3, 4 |
| `app/api/auth/search-users/route.ts` | 1 |
| `.env` / `.env.example` | 2, 7 |

### ไฟล์ใหม่ (New)

| ไฟล์ | เกี่ยวกับข้อ |
|------|------------|
| `app/requests/page.tsx` | 2 |
| `app/api/requests/route.ts` | 2 |
| `lib/download-requests-read.ts` | 2 |
| `app/admin/page.tsx` | 7 |
| `app/api/admin/settings/route.ts` | 7 |
| `app/api/admin/social-links/route.ts` | 7 |
| `lib/admin-settings.ts` | 7 |
| `data/settings.json` | 7 |
| `public/templates/*.csv` | 7 |
| `app/forgot-password/page.tsx` | 5 (Optional) |
| `app/reset-password/page.tsx` | 5 (Optional) |
| `app/api/auth/forgot-password/route.ts` | 5 (Optional) |
| `app/api/auth/reset-password/route.ts` | 5 (Optional) |
