# e-Tax Project Specification

## วัตถุประสงค์
สร้าง Web Application (Node.js) เพื่อดึงใบขายจากระบบ ERP (custom) และนำส่งข้อมูลไปยังระบบ e-tax ของกรมสรรพากรไทย

## คุณสมบัติหลัก
- รองรับการเลือกช่วงวันที่ หรือเลขที่ใบขาย
- ดึงข้อมูลใบขายจาก ERP ผ่าน API หรือ Database
- แปลงข้อมูลใบขายให้อยู่ในรูปแบบ JSON ตามที่กรมสรรพากรกำหนด
- ส่งข้อมูลใบขายไปยัง e-tax API (ตามตัวอย่าง Postman)
- แสดงสถานะการนำส่ง

## สถาปัตยกรรมระบบ
### Backend (Node.js/Express)
- API สำหรับดึงข้อมูลใบขายจาก ERP
- API สำหรับส่งข้อมูลใบขายไปยัง e-tax
- ฟังก์ชันแปลงข้อมูลใบขายเป็น JSON ตาม spec e-tax

### Frontend (React หรือ Template Engine)
- หน้า UI เลือกช่วงวันที่/เลขที่ใบขาย
- แสดงรายการใบขาย
- แสดงสถานะการนำส่ง e-tax

## ตัวอย่าง API e-tax
- Endpoint: `https://uatservice-etax.one.th/etaxjsonws/etaxsigndocument`
- Method: POST
- Content-Type: application/json
- Authorization: ใช้ Bearer Token หรือ Basic ตามตัวอย่างใน Postman
- ตัวอย่าง Request Body: ดูรายละเอียดจากไฟล์ `E-Tax.postman_collection.json`

## ขั้นตอนหลัก
1. ดึงใบขายจาก ERP ตามช่วงวันที่/เลขที่ที่เลือก
2. แปลงข้อมูลใบขายให้อยู่ในรูปแบบ JSON e-tax
3. ส่งข้อมูลไปยัง e-tax API
4. แสดงผลการนำส่งให้ผู้ใช้ทราบ

---

> หมายเหตุ: สามารถขอดูรายละเอียด field หรือโครงสร้าง JSON ได้จากไฟล์ Postman ที่แนบมา
