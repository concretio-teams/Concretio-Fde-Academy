'use strict';
// These tests describe what the legacy report does today. They all pass, which does not mean the report is right.
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { load, isLate, percent } = require('../legacy/report');

test('loads every line of the export as a row', () => {
  const rows = load(path.join(__dirname, '..', 'data', 'shipments.csv'));
  assert.strictEqual(rows.length, 83);
});

test('a plain ISO date after the promise counts as late', () => {
  assert.strictEqual(isLate({ delivered_at: '2026-03-10', promised_date: '2026-03-08' }), true);
});

test('percent rounds to a whole number and handles zero', () => {
  assert.strictEqual(percent(1, 3), 33);
  assert.strictEqual(percent(0, 0), 0);
});
