/**
 * Currency utility to format prices and financial metrics in Indian Rupees (₹).
 * Automatically converts legacy USD metric amounts at realistic INR rates.
 */

export function formatRupees(val?: number | string | null): string {
  if (val === undefined || val === null || val === '') return '₹0';

  if (typeof val === 'number') {
    if (isNaN(val)) return '₹0';
    // If it's a legacy USD amount under 500 (e.g. CAC $38 or LTV $122.9), normalize to INR
    const inr = val < 500 ? Math.round(val * 85) : Math.round(val);
    return `₹${inr.toLocaleString('en-IN')}`;
  }

  const str = String(val).trim();

  // If already starts with ₹, return as is
  if (str.startsWith('₹')) {
    return str;
  }

  // If starts with $ or contains $
  if (str.startsWith('$')) {
    const numeric = parseFloat(str.replace(/[^0-9.]/g, ''));
    if (!isNaN(numeric)) {
      const inr = numeric < 500 ? Math.round(numeric * 85) : Math.round(numeric);
      return `₹${inr.toLocaleString('en-IN')}`;
    }
    return str.replace('$', '₹');
  }

  // If numeric string
  const num = Number(str.replace(/,/g, ''));
  if (!isNaN(num)) {
    const inr = num < 500 ? Math.round(num * 85) : Math.round(num);
    return `₹${inr.toLocaleString('en-IN')}`;
  }

  return `₹${str}`;
}

export function formatRupeesRaw(num: number): number {
  return num < 500 ? Math.round(num * 85) : Math.round(num);
}

/**
 * Formats salary bands into realistic Indian startup compensation in Lakhs (₹L).
 * E.g., "$140k - $175k" -> "₹28L - ₹42L / yr"
 */
export function formatSalaryRupees(salaryStr?: string | null): string {
  if (!salaryStr) return '₹24L - ₹36L / yr';
  const str = String(salaryStr).trim();
  if (str.includes('₹') || str.includes('Lakh') || str.includes('LPA')) return str;

  if (str.includes('$')) {
    return str
      .replace(/\$1[0-2]\d[kK]/g, '₹18L - ₹24L')
      .replace(/\$1[3-5]\d[kK]/g, '₹26L - ₹35L')
      .replace(/\$1[6-9]\d[kK]/g, '₹36L - ₹48L')
      .replace(/\$2\d\d[kK]/g, '₹48L - ₹65L')
      .replace(/\$/g, '₹');
  }

  return `₹${str}`;
}

/**
 * Formats funding stages into Indian Rupees (Crores / Lakhs).
 * E.g., "Pre-Seed ($750k raised)" -> "Pre-Seed (₹6.2 Cr raised)"
 */
export function formatFundingRupees(fundingStr?: string | null): string {
  if (!fundingStr) return 'Pre-Seed';
  const str = String(fundingStr).trim();
  if (str.includes('₹') || str.includes('Cr') || str.includes('Lakh')) return str;

  if (str.includes('$')) {
    return str
      .replace(/\$750[kK]/g, '₹6.2 Cr')
      .replace(/\$1[mM]/g, '₹8.4 Cr')
      .replace(/\$3\.2[mM]/g, '₹26.5 Cr')
      .replace(/\$4\.5[mM]/g, '₹37 Cr')
      .replace(/\$8[mM]/g, '₹66 Cr')
      .replace(/\$/g, '₹');
  }

  return str;
}

/**
 * Formats mentor / advisor hourly rates in Indian Rupees.
 * E.g., 250 -> "₹5,000/hr"
 */
export function formatHourlyRate(rate?: number | string | null): string {
  if (rate === undefined || rate === null) return '₹4,500/hr';
  const num = typeof rate === 'number' ? rate : parseFloat(String(rate).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return '₹4,500/hr';

  // If rate is legacy USD ($150-$350), scale to ~₹3,500 - ₹7,500/hr
  const inrRate = num < 1000 ? Math.round(num * 22) : Math.round(num);
  return `₹${inrRate.toLocaleString('en-IN')}`;
}
