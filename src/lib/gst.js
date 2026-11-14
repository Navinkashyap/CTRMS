// GST place-of-supply rule, shared by every screen that bills a client.
//
//   Supplier and recipient in the SAME state  -> CGST + SGST
//   Different state (or outside India)        -> IGST
//
// The supplier's state comes from its GSTIN (first two digits = state code,
// "09" = Uttar Pradesh for Convaq/Perfectrans). The recipient's state comes from
// their GSTIN when they have one (most reliable), otherwise from the free-text
// state field on the client, which is matched loosely ("U.P.", "Uttar Pradesh",
// "uttarpradesh" all resolve to 09).
//
// Keep in sync with Backend/src/utils/gst.js.

export const COMPANY_GSTIN = '09AAGCC0048P1ZD';

const STATE_CODES = {
  '01': ['jammuandkashmir', 'jammukashmir', 'jk', 'jandk'],
  '02': ['himachalpradesh', 'hp'],
  '03': ['punjab', 'pb'],
  '04': ['chandigarh', 'ch'],
  '05': ['uttarakhand', 'uttaranchal', 'uttrakhand'],
  '06': ['haryana', 'hr'],
  '07': ['delhi', 'newdelhi', 'nctofdelhi', 'nctdelhi', 'dl'],
  '08': ['rajasthan', 'rj'],
  '09': ['uttarpradesh', 'uttarpardesh', 'uttarpardes', 'up'],
  '10': ['bihar', 'br'],
  '11': ['sikkim', 'sk'],
  '12': ['arunachalpradesh', 'ar'],
  '13': ['nagaland', 'nl'],
  '14': ['manipur', 'mn'],
  '15': ['mizoram', 'mz'],
  '16': ['tripura', 'tr'],
  '17': ['meghalaya', 'ml'],
  '18': ['assam', 'as'],
  '19': ['westbengal', 'wb'],
  '20': ['jharkhand', 'jh'],
  '21': ['odisha', 'orissa', 'od', 'or'],
  '22': ['chhattisgarh', 'chattisgarh', 'cg'],
  '23': ['madhyapradesh', 'mp'],
  '24': ['gujarat', 'gj'],
  '26': ['dadraandnagarhavelianddamananddiu', 'dadraandnagarhaveli', 'damananddiu', 'dnh', 'dd'],
  '27': ['maharashtra', 'mh'],
  '29': ['karnataka', 'ka'],
  '30': ['goa', 'ga'],
  '31': ['lakshadweep', 'ld'],
  '32': ['kerala', 'kl'],
  '33': ['tamilnadu', 'tn'],
  '34': ['puducherry', 'pondicherry', 'py'],
  '35': ['andamanandnicobarislands', 'andamanandnicobar', 'an'],
  '36': ['telangana', 'tg', 'ts'],
  '37': ['andhrapradesh', 'ap'],
  '38': ['ladakh', 'la'],
};

const NAME_TO_CODE = Object.entries(STATE_CODES).reduce((map, [code, names]) => {
  names.forEach((n) => { map[n] = code; });
  return map;
}, {});

const INDIA = ['india', 'in', 'ind', 'bharat', 'republicofindia'];

const normalize = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

// "09AAGCC0048P1ZD" -> "09"
export function stateCodeFromGstin(gstin) {
  const match = String(gstin ?? '').trim().match(/^(\d{2})[A-Z0-9]{13}$/i);
  return match ? match[1] : '';
}

// "Uttar Pradesh" / "U.P." / "09" -> "09"
export function stateCodeFromName(state) {
  const key = normalize(state);
  if (!key) return '';
  if (/^\d{1,2}$/.test(key)) return key.padStart(2, '0');
  return NAME_TO_CODE[key] || '';
}

/**
 * True when the supply is intra-state (CGST + SGST), false for IGST.
 * @param {object} p
 * @param {string} [p.supplierGstin] our GSTIN (defaults to the company's)
 * @param {string} [p.gstin]   recipient GSTIN
 * @param {string} [p.state]   recipient state name
 * @param {string} [p.country] recipient country name
 */
export function isSameState({ supplierGstin, gstin, state, country } = {}) {
  const supplierCode = stateCodeFromGstin(supplierGstin) || stateCodeFromGstin(COMPANY_GSTIN);

  const recipientGstinCode = stateCodeFromGstin(gstin);
  if (recipientGstinCode) return recipientGstinCode === supplierCode;

  const countryKey = normalize(country);
  if (countryKey && !INDIA.includes(countryKey)) return false;

  const recipientCode = stateCodeFromName(state);
  return !!recipientCode && recipientCode === supplierCode;
}

/** Same-state check for a client record ({ state, gstIn, country }). */
export function isClientSameState(client, supplierGstin) {
  if (!client) return false;
  return isSameState({
    supplierGstin,
    gstin: client.gstIn,
    state: client.state,
    country: client.country,
  });
}

/**
 * Split the tax on `subtotal` according to the place-of-supply rule.
 * Returns amounts for all three heads (unused ones are 0) plus the total tax.
 */
export function calcGst(subtotal, { gstEnabled, cgstPercent, sgstPercent, igstPercent } = {}, sameState) {
  const base = Number(subtotal) || 0;
  const result = {
    sameState: !!sameState,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    taxAmount: 0,
    taxPercent: 0,
  };
  if (!gstEnabled) return result;

  if (sameState) {
    const c = Number(cgstPercent) || 0;
    const s = Number(sgstPercent) || 0;
    result.cgstAmount = (base * c) / 100;
    result.sgstAmount = (base * s) / 100;
    result.taxPercent = c + s;
  } else {
    const i = Number(igstPercent) || 0;
    result.igstAmount = (base * i) / 100;
    result.taxPercent = i;
  }
  result.taxAmount = result.cgstAmount + result.sgstAmount + result.igstAmount;
  return result;
}
