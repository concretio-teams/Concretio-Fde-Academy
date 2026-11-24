'use strict';
// Northwind Parcel's existing "late deliveries" report. Written by an analyst who has since left.
// Run: node legacy/report.js   (prints late % per carrier)
const fs = require('node:fs');
const path = require('node:path');

function load(file) {
  const text = fs.readFileSync(file, 'utf8').trim().split('\n');
  const head = text[0].split(',');
  return text.slice(1).map((line) => {
    const cells = line.split(',');
    const row = {};
    head.forEach((h, i) => { row[h] = cells[i]; });
    return row;
  });
}

function isLate(row) {
  return row.delivered_at > row.promised_date;
}

function lateByCarrier(rows) {
  const out = {};
  for (const r of rows) {
    const c = r.carrier;
    out[c] = out[c] || { total: 0, late: 0 };
    out[c].total += 1;
    if (isLate(r)) out[c].late += 1;
  }
  return out;
}

function percent(n, d) {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

if (require.main === module) {
  const rows = load(path.join(__dirname, '..', 'data', 'shipments.csv'));
  const by = lateByCarrier(rows);
  console.log('Late deliveries by carrier');
  for (const [carrier, v] of Object.entries(by)) console.log(`${carrier.padEnd(12)} ${percent(v.late, v.total)}%  (${v.late}/${v.total})`);
}

module.exports = { load, isLate, lateByCarrier, percent };
