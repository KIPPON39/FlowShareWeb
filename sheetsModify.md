# FlowShare — Google Sheets Column Mapping Guide

เอกสารนี้อธิบายโครงสร้างคอลัมน์ที่ใช้ใน Google Sheets สำหรับ FlowShare

---

## Workflows Sheet (Flows Data)

ข้อมูล Workflow ทั้งหมดจะถูกเก็บใน Google Sheets ผ่าน n8n webhook
**Spreadsheet ID:** `1D2KkNgeW10RhVKhuBtqnwZbXUES2Tj69azfv0k86X2E`

| คอลัมน์       | ชื่อฟิลด์        | ประเภท      | รายละเอียด |
|---------------|-------------------|-------------|------------|
| A             | `id`              | string      | รหัส Flow ไม่ซ้ำกัน เช่น `FW-260527-3847` (สร้างอัตโนมัติจาก `generateFlowId()`) |
| B             | `title`           | string      | ชื่อ Workflow |
| C             | `description`     | string      | คำอธิบาย Workflow |
| D             | `tags`            | JSON array  | แท็กหมวดหมู่ เช่น `["AI","Gmail","Customer"]` |
| E             | `keys`            | JSON array  | Credential ที่ต้องใช้ เช่น `["OpenAI","Gmail API"]` |
| F             | `creators`        | JSON array  | ผู้สร้าง เช่น `[{"name":"wisit","email":"wisit@kku.ac.th","imageUrl":"...","role":"creator"}]` |
| G             | `nodes`           | number      | จำนวน nodes ใน flow |
| H             | `views`           | number      | จำนวนครั้งที่ดู **(ข้อมูลจริง)** |
| I             | `downloads`       | number      | จำนวนครั้งที่ดาวน์โหลด **(ข้อมูลจริง)** |
| J             | `steps`           | JSON array  | ขั้นตอน how-to-use |
| K             | `raw_json`        | JSON string | เนื้อหาไฟล์ JSON ดิบ |
| L             | `json_file_url`   | string      | URL ไฟล์ JSON (ถ้ามี) |
| M             | `created_at`      | ISO 8601    | วันที่สร้าง |
| N             | `updated_at`      | ISO 8601    | วันที่แก้ไขล่าสุด |

### หมายเหตุ

- **`id`**: ระบบใหม่ใช้ `generateFlowId()` สร้างรหัส `FW-YYMMDD-XXXX` อัตโนมัติ เพื่อป้องกันการซ้ำกันจากชื่อไฟล์
- **`views` / `downloads`**: ต้องเก็บตัวเลขจริง (ไม่ใช้ random)
  - `views` ควรเพิ่มทุกครั้งที่มีคนเปิดดูหน้า workflow detail
  - `downloads` ควรเพิ่มทุกครั้งที่มี download request สำเร็จ
- **`creators`**: ใช้ชื่อจาก username ในระบบ ไม่ใช่ email prefix อีกต่อไป

---

## Users Sheet (Authentication)

ข้อมูลผู้ใช้เก็บใน Google Sheets ผ่าน n8n register webhook

| คอลัมน์       | ชื่อฟิลด์         | ประเภท      | รายละเอียด |
|---------------|---------------------|-------------|------------|
| A             | `username`          | string      | ชื่อผู้ใช้ (unique) |
| B             | `passwordHash`      | string      | รหัสผ่านที่ hash ด้วย bcrypt |
| C             | `createdAt`         | ISO 8601    | วันที่สมัคร |
| D             | `email`             | string      | อีเมล |
| E             | `imageUrl`          | string      | URL รูปโปรไฟล์ |
| F             | `role`              | string      | บทบาท เช่น `User`, `Admin` |

### หมายเหตุ

- API `/api/auth/search-users?q=xxx` จะอ่าน A:F เพื่อค้นหา user ด้วย username หรือ email
- ใช้ partial match (ไม่ต้อง exact) — พิมพ์ "wis" จะเจอ "wisit"
- ผลลัพธ์ไม่รวม password hash — ส่งกลับเฉพาะ `username`, `email`, `imageUrl`

---

## การเพิ่มข้อมูลในอนาคต

หากต้องการเพิ่มข้อมูลใหม่ เช่น `likes`, `comments`, `stars`:
1. เพิ่มคอลัมน์ใน Google Sheets
2. อัปเดต n8n webhook ให้รับและบันทึกค่า
3. อัปเดต `WorkflowTemplate` interface ใน `lib/workflows.ts`
4. อัปเดต CSV parser ใน `app/api/workflows/route.ts`
