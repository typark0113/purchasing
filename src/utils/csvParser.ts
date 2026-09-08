import { Quote } from '../types';

export function parseCSV(csvText: string): Quote[] {
  const lines = csvText.split(/\r\n|\n/);
  if (lines.length === 0) return [];

  // Remove BOM if present
  let headerLine = lines[0];
  if (headerLine.charCodeAt(0) === 0xfeff) {
    headerLine = headerLine.slice(1);
  }

  // Parse header
  const headers = parseCSVLine(headerLine).map((h) => h.trim().toLowerCase());
  
  // Find column indices
  const getIdx = (names: string[]) => {
    for (const name of names) {
      const idx = headers.indexOf(name);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idIdx = getIdx(['quote_id', 'quoteid', '견적번호', 'id']);
  const prIdx = getIdx(['pr_no', 'prno', 'pr번호', 'pr']);
  const itemCodeIdx = getIdx(['item_code', 'itemcode', '품목코드']);
  const itemNameIdx = getIdx(['item_name', 'itemname', '품목명']);
  const supplierIdx = getIdx(['supplier', '공급사', '업체']);
  const unitIdx = getIdx(['unit', '단위']);
  const qtyIdx = getIdx(['qty', '수량']);
  const priceIdx = getIdx(['unit_price', 'unitprice', '단가']);
  const currIdx = getIdx(['currency', '통화']);
  const qDateIdx = getIdx(['quote_date', 'quotedate', '견적일']);
  const reqDateIdx = getIdx(['required_date', 'requireddate', '필요일', '요청일']);
  const promDateIdx = getIdx(['promised_date', 'promiseddate', '납기일', '약속납기']);
  const statusIdx = getIdx(['status', '상태']);
  const remarkIdx = getIdx(['remark', '비고']);

  const results: Quote[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    if (cols.length === 0) continue;

    const getCol = (idx: number) => (idx !== -1 && cols[idx] !== undefined ? cols[idx].trim() : '');

    const quote_id = getCol(idIdx) || `QT-${String(i).padStart(3, '0')}`;
    const pr_no = getCol(prIdx) || 'PR-2026-999';
    const item_code = getCol(itemCodeIdx) || 'IT-001';
    const item_name = getCol(itemNameIdx) || '일반품목';
    const supplier = getCol(supplierIdx) || '기타공급사';
    const unit = getCol(unitIdx) || 'EA';
    
    const qtyRaw = getCol(qtyIdx).replace(/,/g, '');
    const qty = isNaN(Number(qtyRaw)) || qtyRaw === '' ? 1 : Number(qtyRaw);

    const priceRaw = getCol(priceIdx).replace(/,/g, '');
    let unit_price: number | null = null;
    if (priceRaw !== '' && priceRaw !== '-' && priceRaw.toLowerCase() !== 'n/a' && !isNaN(Number(priceRaw))) {
      unit_price = Number(priceRaw);
    }

    const currency = getCol(currIdx) || 'KRW';
    const quote_date = getCol(qDateIdx) || '2026-08-01';
    const required_date = getCol(reqDateIdx) || '2026-09-01';

    const promRaw = getCol(promDateIdx);
    let promised_date: string | null = null;
    if (promRaw && promRaw !== '-' && promRaw.toLowerCase() !== 'n/a') {
      promised_date = promRaw;
    }

    const statusRaw = getCol(statusIdx);
    const status: '견적' | '발주' = statusRaw === '발주' ? '발주' : '견적';
    const remark = getCol(remarkIdx);

    results.push({
      quote_id,
      pr_no,
      item_code,
      item_name,
      supplier,
      unit,
      qty,
      unit_price,
      currency,
      quote_date,
      required_date,
      promised_date,
      status,
      remark,
    });
  }

  return results;
}

function parseCSVLine(text: string): string[] {
  // Simple CSV parser supporting quotes and commas/tabs
  const res: string[] = [];
  let current = '';
  let inQuotes = false;

  // Detect delimiter: comma or tab
  const delimiter = text.includes('\t') ? '\t' : ',';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      res.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  res.push(current.trim());
  return res;
}

export function exportToCSV(quotes: Quote[]): string {
  const headers = [
    'quote_id',
    'pr_no',
    'item_code',
    'item_name',
    'supplier',
    'unit',
    'qty',
    'unit_price',
    'currency',
    'quote_date',
    'required_date',
    'promised_date',
    'status',
    'remark',
  ];

  const rows = quotes.map((q) => [
    q.quote_id,
    q.pr_no,
    q.item_code,
    `"${q.item_name}"`,
    `"${q.supplier}"`,
    q.unit,
    q.qty,
    q.unit_price ?? '',
    q.currency,
    q.quote_date,
    q.required_date,
    q.promised_date ?? '',
    q.status,
    `"${q.remark || ''}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
