'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const core = require('../src/core.js');

const items = [
  { type: 'monthly', months: 12, qty: 5, unit: 44000 },
  { type: 'fixed', months: 1, qty: 1, unit: 110000 }
];

test('UFTR-5 포함가 기준견적 총액 검증', () => {
  assert.equal(core.itemSum(items[0]), 2640000);
  assert.equal(core.itemSum(items[1]), 110000);
  assert.deepEqual(core.totals(items, 'included'), {
    raw: 2750000, base: 2500000, vat: 250000, total: 2750000
  });
});

test('UFTR-5 한글 금액 변환', () => {
  assert.equal('일금 ' + core.amountKorean(2750000) + '원정',
               '일금 이백칠십오만원정');
  assert.equal(core.amountKorean(0), '영');
  assert.equal(core.amountKorean(100000000), '일억');
});

test('UFTR-5 별도가와 면세가 분리', () => {
  assert.deepEqual(core.totals(items, 'excluded'), {
    raw: 2750000, base: 2750000, vat: 275000, total: 3025000
  });
  assert.deepEqual(core.totals(items, 'exempt'), {
    raw: 2750000, base: 2750000, vat: 0, total: 2750000
  });
});

test('UFTR-4 일반수량과 정액', () => {
  assert.equal(core.itemSum({ type: 'quantity', qty: 3, unit: 7000 }), 21000);
  assert.equal(core.itemSum({ type: 'fixed', qty: 0, months: 0, unit: 30000 }), 30000);
});

test('UFTR-5 안전 정수 범위 초과 거부', () => {
  assert.throws(() => core.totals([
    {type: 'monthly', months: 10000, qty: 100000, unit: 1000000000000}
  ], 'included'), RangeError);
});

test('UFTR-9 JSON 구조 또는 계산방식 검증', () => {
  const defaults = { vendor: { name: '' }, items: [], issued: '', validDays: 30 };
  assert.throws(() => core.validateQuote({}, defaults), /형식/);
  assert.throws(() => core.validateQuote({
    vendor: {}, items: [{ type: 'unknown' }]
  }, defaults), /계산 방식/);
});

test('UFTR-9 JSON 검증 및 복원', () => {
  const defaults = { vendor: {name: '공급자'}, items: [], issued: '', validDays: 30, seal: '' };
  const raw = { vendor: {name: '공급자2'},
    items: [{type:'fixed', name:'관리비', qty:1, months:1, unit:110000}],
    vatMode:'exempt' };
  const quote = core.validateQuote(raw, defaults);
  assert.equal(quote.vendor.name, '공급자2');
  assert.equal(quote.vatMode, 'exempt');
  assert.equal(core.totals(quote.items, quote.vatMode).total, 110000);
});
