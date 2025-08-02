const axios = require('axios');
const crypto = require('crypto');
const https = require('https');

// CONFIG (อ่านจาก .env เท่านั้น)
const ERP_LOGIN_URL = process.env.ERP_LOGIN_URL;
const ERP_INVOICE_URL = process.env.ERP_INVOICE_URL;
const ERP_USERNAME = process.env.ERP_USERNAME;
const ERP_PASSWORD = process.env.ERP_PASSWORD;
const COOKIE_NAME_ACCESS = process.env.ERP_COOKIE_NAME_ACCESS || 'AccessToken';
const COOKIE_NAME_REFRESH = process.env.ERP_COOKIE_NAME_REFRESH || 'RefreshToken';
const ENCRYPT_KEY = process.env.ERP_ENCRYPT_KEY;
const ENCRYPT_IV = process.env.ERP_ENCRYPT_IV;

// ตรวจสอบ config
const missingVars = [];
if (!ERP_LOGIN_URL) missingVars.push('ERP_LOGIN_URL');
if (!ERP_INVOICE_URL) missingVars.push('ERP_INVOICE_URL');
if (!ERP_USERNAME) missingVars.push('ERP_USERNAME');
if (!ERP_PASSWORD) missingVars.push('ERP_PASSWORD');
if (!COOKIE_NAME_ACCESS) missingVars.push('ERP_COOKIE_NAME_ACCESS');
if (!COOKIE_NAME_REFRESH) missingVars.push('ERP_COOKIE_NAME_REFRESH');
if (!ENCRYPT_KEY) missingVars.push('ERP_ENCRYPT_KEY');
if (!ENCRYPT_IV) missingVars.push('ERP_ENCRYPT_IV');
if (missingVars.length > 0) {
  throw new Error('Missing ERP config in .env: ' + missingVars.join(', '));
}



let tokenCache = null; // { access_token, refresh_token, expire_date }

function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPT_KEY, ENCRYPT_IV);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}
function decrypt(text) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPT_KEY, ENCRYPT_IV);
  let decrypted = decipher.update(text, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Login to ERP and get tokens
async function loginERP() {
  const payload = {
    Username: ERP_USERNAME,
    Password: ERP_PASSWORD
  };
  const resp = await axios.post(
    ERP_LOGIN_URL,
    payload,
    {
      validateStatus: () => true,
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    }
  );
  if (resp.data && resp.data.IS_SUCCESS && resp.data.RESULT) {
    const { ACCESS_TOKEN, REFRESH_TOKEN } = resp.data.RESULT;
    tokenCache = {
      access_token: ACCESS_TOKEN.TOKEN,
      refresh_token: REFRESH_TOKEN.TOKEN,
      expire_date: ACCESS_TOKEN.EXPIRE_DATE
    };
    // Save encrypted cookies for access/refresh tokens
    tokenCache.cookieAccess = encrypt(tokenCache.access_token);
    tokenCache.cookieRefresh = encrypt(tokenCache.refresh_token);
    return tokenCache;
  } else {
    throw new Error(JSON.stringify(resp.data) || 'ERP Login Failed');
  }
}

// Get token from cache or login
async function getValidToken() {
  if (!tokenCache || new Date(tokenCache.expire_date) < new Date()) {
    await loginERP();
  }
  return tokenCache.access_token;
}

// Fetch invoices from ERP (real)
exports.fetchInvoices = async ({ dateFrom, dateTo, invoiceFrom, invoiceTo, page = 1, pageSize = 10 }) => {
  const access_token = await getValidToken();
  // OData paging
  const skip = (page - 1) * pageSize;
  let query = `$count=true&$top=${pageSize}&$skip=${skip}`;
  // สามารถเพิ่ม filter เงื่อนไขอื่นๆ ได้ถ้าต้องการ
  const url = `${ERP_INVOICE_URL}?${query}`;
  const resp = await axios.get(url, {
    headers: {
      Cookie: `${COOKIE_NAME_ACCESS}=${tokenCache.cookieAccess}; ${COOKIE_NAME_REFRESH}=${tokenCache.cookieRefresh}`,
      Authorization: `Bearer ${access_token}`
    },
    validateStatus: () => true,
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });
  if (resp.data && resp.status === 200) {
    // สมมติ resp.data.value เป็น array ของ invoice
    return {
      items: resp.data.value || [],
      total: resp.data['@odata.count'] || 0 // ต้องเปิด OData $count ที่ฝั่ง ERP
    };
  } else {
    throw new Error(resp.data?.message || 'Fetch invoices failed');
  }
};

// Fetch single invoice by id (real)
exports.getInvoiceById = async (id) => {
  const access_token = await getValidToken();
  // OData: ใช้ (id) สำหรับ int, ไม่ต้องใส่ single quote
  const url = `${ERP_INVOICE_URL}(${id})?$expand=SAL_SALES_INVOICE_ITEM`;
  try {
    const resp = await axios.get(url, {
      headers: {
        Cookie: `${COOKIE_NAME_ACCESS}=${tokenCache.cookieAccess}; ${COOKIE_NAME_REFRESH}=${tokenCache.cookieRefresh}`,
        Authorization: `Bearer ${access_token}`
      },
      validateStatus: () => true,
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });
    if (resp.data && resp.status === 200) {
      return resp.data;
    } else {
      throw new Error(resp.data?.message || `Fetch invoice by id failed (status: ${resp.status})`);
    }
  } catch (error) {
    // เพิ่ม log ข้อผิดพลาด
    console.error('getInvoiceById error:', error.message);
    throw error;
  }
};

// --- MOCK fallback (for dev/test) ---
const mockInvoices = [
  {
    id: 'INV001',
    date: '2025-08-01',
    number: 'INV001',
    customer: 'บริษัท ทดสอบ จำกัด',
    amount: 1000.00,
    tax: 70.00
  },
  {
    id: 'INV002',
    date: '2025-08-02',
    number: 'INV002',
    customer: 'บริษัท สมมติ จำกัด',
    amount: 2000.00,
    tax: 140.00
  }
];
exports.fetchInvoicesMock = async (filter) => mockInvoices;
exports.getInvoiceByIdMock = async (id) => mockInvoices.find(inv => inv.id === id);
exports.loginERP = loginERP;
