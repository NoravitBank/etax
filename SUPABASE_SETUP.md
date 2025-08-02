# Supabase Setup Guide

คู่มือนี้สำหรับการตั้งค่า Supabase เพื่อใช้เก็บ log การส่งข้อมูล e-tax (response.data + SALES_INVOICE_NO)

---

## 1. สมัครและสร้าง Project บน Supabase
1. ไปที่ https://supabase.com/ และสมัครสมาชิก/เข้าสู่ระบบ
2. กด "New Project" และกรอกข้อมูลตามขั้นตอน

## 2. สร้าง Table (etax_logs)
1. เข้า Project > เลือก "Table Editor"
2. กด "New Table" กำหนดค่า:
   - Table name: `etax_logs`
   - Columns:
     - `id` (BigInt, Primary Key, Auto Increment)
     - `sales_invoice_no` (Text, ไม่ null)
     - `pdf_url` (Text, nullable)
     - `xml_url` (Text, nullable)
     - `status` (Text, nullable)
     - `transaction_code` (Text, nullable)
     - `response_data` (JSON, ไม่ null)
     - `created_at` (Timestamp with time zone, default: now())
3. กด "Save"

## 3. ตั้งค่า API Key & URL ใน .env
เพิ่มค่าต่อไปนี้ในไฟล์ `.env` ของโปรเจกต์:

```
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_KEY=<your-service-role-or-anon-key>
```

- สามารถหา URL และ Key ได้ที่ Supabase Project > Settings > API
- **แนะนำให้ใช้ Service Role Key เฉพาะฝั่ง Server**

## 4. ติดตั้งไลบรารี

```
npm install @supabase/supabase-js
```

## 5. ตัวอย่างการใช้งานในโค้ด (Node.js)

ดูที่ไฟล์ `src/services/supabase.js` สำหรับตัวอย่างการเชื่อมต่อ

## 6. การบันทึก Log
ระบบจะบันทึกข้อมูล response.data + SALES_INVOICE_NO ทุกครั้งที่มีการ submit ไปยัง e-tax API

---

หากมีปัญหาการเชื่อมต่อหรือใช้งาน Supabase ให้ตรวจสอบว่า .env กำหนดค่า SUPABASE_URL และ SUPABASE_KEY ถูกต้อง
