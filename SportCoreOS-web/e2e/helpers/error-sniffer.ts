import { Page, expect } from '@playwright/test';

export function attachStrictErrorSniffer(page: Page) {
  const errors: string[] = [];

  page.on('pageerror', (err) => {
    errors.push(`[JS Exception] ${err.message}`);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore normal favicon 404 or expected dev logs
      if (!text.includes('favicon.ico')) {
        errors.push(`[Console Error] ${text}`);
      }
    }
  });

  page.on('response', (response) => {
    const url = response.url();
    const status = response.status();
    if (
      status >= 400 &&
      !url.includes('/favicon.ico') &&
      !url.includes('/auth/refresh')
    ) {
      errors.push(`[HTTP ${status}] ${response.request().method()} en ${url}`);
    }
  });

  return {
    assertZeroErrors: () => {
      expect(errors, `Se detectaron errores en la vista:\n${errors.join('\n')}`).toEqual([]);
    },
    getErrors: () => errors,
    clear: () => {
      errors.length = 0;
    },
  };
}
