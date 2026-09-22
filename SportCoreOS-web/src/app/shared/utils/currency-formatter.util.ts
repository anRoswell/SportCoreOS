/**
 * Currency Formatter Utility for SportCoreOS
 * Standardizes Colombian & Latin American currency format ($ 1.500.000)
 */

export function formatSportCurrency(value: number | string | null | undefined, includeSymbol: boolean = true, suffix: string = ''): string {
  if (value === null || value === undefined || value === '') {
    return includeSymbol ? '$ 0' + (suffix ? ' ' + suffix : '') : '0';
  }

  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, '')) : value;
  if (isNaN(num)) {
    return includeSymbol ? '$ 0' : '0';
  }

  // Format with dots for thousands and no decimal places for COP currency
  const parts = Math.round(num).toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formatted = parts.join(',');

  const prefix = includeSymbol ? '$ ' : '';
  const post = suffix ? ' ' + suffix : '';
  return `${prefix}${formatted}${post}`;
}

export function parseSportCurrency(value: string | number | null | undefined): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const clean = value.toString().replace(/[^0-9-]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}
