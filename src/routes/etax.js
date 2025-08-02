const express = require('express');
const router = express.Router();
const erp = require('../services/erp');
const etax = require('../services/etax');

// POST: Login ERP
router.post('/login', async (req, res) => {
  try {
    await erp.loginERP();
    res.render('etax/index', { invoices: null, result: { success: true, data: 'ERP Login Success' }, page: 1, totalPages: 1 });
  } catch (err) {
    res.render('etax/index', { invoices: null, result: { success: false, error: err.message }, page: 1, totalPages: 1 });
  }
});

// GET: UI for selecting date/invoice range and listing invoices
router.get('/', async (req, res) => {
  res.render('etax/index', { invoices: null, result: null, page: 1, totalPages: 1 });
});

// GET: Fetch invoices from ERP by page (for paging links)
router.get('/fetch', async (req, res) => {
  // เก็บ filter ล่าสุดใน session หรือ query string ถ้าต้องการ
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  // สำหรับ demo นี้จะไม่ filter เพิ่มเติม
  const { items, total } = await erp.fetchInvoices({ page, pageSize });
  const totalPages = Math.ceil(total / pageSize) || 1;
  res.render('etax/index', {
    invoices: items,
    page,
    totalPages,
    result: null
  });
});

// POST: Fetch invoices from ERP by date or invoice number range
router.post('/fetch', async (req, res) => {
  const { dateFrom, dateTo, invoiceFrom, invoiceTo } = req.body;
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const { items, total } = await erp.fetchInvoices({ dateFrom, dateTo, invoiceFrom, invoiceTo, page, pageSize });
  const totalPages = Math.ceil(total / pageSize) || 1;
  res.render('etax/index', {
    invoices: items,
    page,
    totalPages,
    result: null
  });
});

// POST: Submit selected invoice to e-tax
router.post('/submit', async (req, res) => {
  const { invoiceId } = req.body;
  const invoice = await erp.getInvoiceById(invoiceId);
  console.log(invoice);
  const etaxPayload = etax.transformInvoice(invoice);
  const result = await etax.submitToEtax(etaxPayload);
  res.render('etax/index', { invoices: [invoice], result, page: 1, totalPages: 1 });
});

module.exports = router;
