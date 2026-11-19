/*
 * 견적서 계산 및 JSON 검증 (Node.js / 브라우저 공용)
 * Jira: UFTR-4, UFTR-5, UFTR-9
 * 외부 의존성 없음.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.QuoteCore = api;
})(typeof window !== 'undefined' ? window : undefined, function () {
  'use strict';

  function numint(value) {
    const n = Number(String(value === null || value === undefined ? 0 : value).replace(/,/g, ''));
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.round(Math.min(n, Number.MAX_SAFE_INTEGER));
  }

  function money(value) {
    return numint(value).toLocaleString('ko-KR');
  }

  function ensureSafe(value) {
    if (!Number.isSafeInteger(value) || value < 0)
      throw new RangeError('금액이 계산 가능한 범위를 초과했습니다.');
    return value;
  }

  function itemSum(item) {
    const unit = numint(item.unit);
    const quantity = item.type === 'fixed' ? 1 : numint(item.qty);
    const months = item.type === 'monthly' ? numint(item.months) : 1;
    return ensureSafe(unit * quantity * months);
  }

  function totals(items, vatMode = 'included') {
    let raw = 0;
    for (const item of items || []) raw = ensureSafe(raw + itemSum(item));
    let base, vat, total;
    if (vatMode === 'excluded') {
      base = raw;
      vat = Math.round(raw / 10);
      total = ensureSafe(base + vat);
    } else if (vatMode === 'exempt') {
      base = raw;
      vat = 0;
      total = raw;
    } else {
      // VAT가 이미 포함된 금액을 입력하므로 10%를 다시 가산하지 않는다.
      total = raw;
      vat = Math.round(total / 11);
      base = total - vat;
    }
    return { raw, base, vat, total };
  }

  function amountKorean(value) {
    let n = numint(value);
    if (n === 0) return '영';
    const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
    const places = ['', '십', '백', '천'];
    const groups = ['', '만', '억', '조', '경'];
    const parts = [];
    for (let i = 0; n > 0 && i < groups.length; i++) {
      let chunk = n % 10000;
      let segment = '';
      for (let p = 0; p < 4; p++) {
        const d = chunk % 10;
        chunk = Math.floor(chunk / 10);
        if (d) segment = (d === 1 && p > 0 ? '' : digits[d]) + places[p] + segment;
      }
      if (segment) parts.unshift(segment + groups[i]);
      n = Math.floor(n / 10000);
    }
    return parts.join('');
  }

  function safeText(value) {
    return String(value === null || value === undefined ? '' : value).slice(0, 3000);
  }

  function validateQuote(raw, defaults) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) ||
        !raw.vendor || typeof raw.vendor !== 'object' || Array.isArray(raw.vendor) ||
        !Array.isArray(raw.items)) {
      throw new Error('견적서 데이터 형식이 올바르지 않습니다.');
    }
    if (raw.items.length > 100) throw new Error('품목은 최대 100개까지 지원합니다.');

    const fresh = JSON.parse(JSON.stringify(defaults));
    for (const field of ['issued', 'quoteNo', 'client', 'contact', 'greeting', 'remarks']) {
      if (Object.prototype.hasOwnProperty.call(raw, field)) fresh[field] = safeText(raw[field]);
    }
    fresh.vatMode = ['included', 'excluded', 'exempt'].includes(raw.vatMode)
      ? raw.vatMode : 'included';
    fresh.validDays = Math.min(numint(raw.validDays ?? defaults.validDays), 999);
    fresh.showVatBreakdown = Boolean(raw.showVatBreakdown);

    for (const field of Object.keys(defaults.vendor)) {
      if (Object.prototype.hasOwnProperty.call(raw.vendor, field))
        fresh.vendor[field] = safeText(raw.vendor[field]);
    }
    fresh.items = raw.items.map((item, index) => {
      if (!item || typeof item !== 'object' ||
          !['monthly', 'quantity', 'fixed'].includes(item.type))
        throw new Error('품목 ' + (index + 1) + '의 계산 방식이 올바르지 않습니다.');
      const unit = numint(item.unit);
      if (unit > 1000000000000) throw new Error('단가가 너무 큽니다.');
      return {
        id: 'loaded-' + index,
        name: safeText(item.name),
        type: item.type,
        months: Math.min(numint(item.months), 9999),
        qty: Math.min(numint(item.qty), 100000),
        unit
      };
    });
    fresh.seal = typeof raw.seal === 'string' && raw.seal.length < 2500000 &&
      /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(raw.seal) ? raw.seal : '';
    totals(fresh.items, fresh.vatMode);
    return fresh;
  }

  return { numint, money, itemSum, totals, amountKorean, validateQuote };
});
