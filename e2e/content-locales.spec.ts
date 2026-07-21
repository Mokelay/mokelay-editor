import { expect, test } from '@playwright/test';
import { COMMON_CONTENT_LOCALES, formatContentLocale } from '../src/i18n/contentLocales';
import { defaultPageUuid, resetEditor } from './helpers/editor';

test('common content locale catalog contains 20 unique, formatted locales', () => {
  expect(COMMON_CONTENT_LOCALES).toHaveLength(20);
  expect(new Set(COMMON_CONTENT_LOCALES.map(({ code }) => code)).size).toBe(20);
  for (const locale of COMMON_CONTENT_LOCALES) {
    expect(formatContentLocale(locale.code)).toBe(`${locale.nativeName}（${locale.code}）`);
  }
});

test('selects common and custom content locales and saves localeConfig', async ({ page }) => {
  const apiState = await resetEditor(page, {
    pages: [{
      uuid: defaultPageUuid,
      name: 'Localized page',
      localeConfig: {
        defaultLocale: 'zh-CN',
        supportedLocales: ['zh-CN', 'en-US']
      },
      blocks: [{ type: 'paragraph', data: { text: '你好' } }]
    }]
  });

  const search = page.getByTestId('supported-locales-search');
  await expect(search).toHaveValue('简体中文（zh-CN）, English（en-US）');
  await search.click();
  await search.fill('ja-JP');
  await page.getByRole('option', { name: '日本語（ja-JP）' }).click();

  await search.fill('fr-FR');
  await page.getByRole('option', { name: 'Français（fr-FR）' }).click();

  await search.fill('ar-SA');
  await page.getByRole('option', { name: 'العربية（ar-SA）' }).click();

  await search.fill('sv-SE');
  await page.getByTestId('add-custom-locale').click();
  await expect(search).toHaveValue(/日本語（ja-JP）.*Français（fr-FR）.*العربية（ar-SA）.*sv-SE/);

  const settings = page.getByTestId('page-locale-settings');
  const selects = settings.locator('select');
  await expect(selects.nth(0).locator('option')).toHaveCount(6);
  await selects.nth(0).selectOption('ja-JP');
  await selects.nth(1).selectOption('ar-SA');
  await page.getByTestId('save-button').click();

  await expect.poll(() => apiState.pageUpdatePayloads.length).toBe(1);
  expect(apiState.pageUpdatePayloads[0]?.localeConfig).toEqual({
    defaultLocale: 'ja-JP',
    supportedLocales: ['zh-CN', 'en-US', 'ja-JP', 'fr-FR', 'ar-SA', 'sv-SE']
  });
});

test('supports selecting and saving every preset content locale without a quantity limit', async ({ page }) => {
  const apiState = await resetEditor(page, {
    pages: [{
      uuid: defaultPageUuid,
      name: 'All locales page',
      localeConfig: { defaultLocale: 'zh-CN', supportedLocales: ['zh-CN'] },
      blocks: [{ type: 'paragraph', data: { text: '你好' } }]
    }]
  });

  const localeSelect = page.getByTestId('supported-locales-select');
  const initialSelectHeight = await localeSelect.evaluate((element) => element.getBoundingClientRect().height);
  const search = page.getByTestId('supported-locales-search');
  for (const locale of COMMON_CONTENT_LOCALES.slice(1)) {
    await search.click();
    await search.fill(locale.code);
    await page.getByRole('option', { name: formatContentLocale(locale.code) }).click();
  }

  await expect(page.getByTestId('page-locale-settings').locator('select').nth(0).locator('option')).toHaveCount(20);
  await expect.poll(() => localeSelect.evaluate((element) => element.getBoundingClientRect().height))
    .toBe(initialSelectHeight);

  await page.getByTestId('save-button').click();
  await expect.poll(() => apiState.pageUpdatePayloads.length).toBe(1);
  expect(apiState.pageUpdatePayloads[0]?.localeConfig?.supportedLocales)
    .toEqual(COMMON_CONTENT_LOCALES.map(({ code }) => code));
});

test('adding a locale preserves existing locales without showing the removal confirmation', async ({ page }) => {
  await resetEditor(page, {
    pages: [{
      uuid: defaultPageUuid,
      name: 'Traditional Chinese page',
      localeConfig: { defaultLocale: 'zh-TW', supportedLocales: ['zh-TW', 'en-US'] },
      blocks: [{ type: 'paragraph', data: { text: '你好' } }]
    }]
  });

  const dialogMessages: string[] = [];
  page.on('dialog', async (dialog) => {
    dialogMessages.push(dialog.message());
    await dialog.dismiss();
  });

  const defaultLocale = page.getByTestId('page-locale-settings').locator('select').nth(0);
  await expect(defaultLocale.locator('option')).toHaveCount(2);
  const search = page.getByTestId('supported-locales-search');
  await search.click();
  await search.fill('zh-CN');
  await page.getByRole('option', { name: '简体中文（zh-CN）' }).click();

  await expect(defaultLocale.locator('option')).toHaveCount(3);
  expect(dialogMessages).toEqual([]);
});

test('keeps at least one locale and restores removal when confirmation is cancelled', async ({ page }) => {
  await resetEditor(page, {
    pages: [{
      uuid: defaultPageUuid,
      name: 'Localized page',
      localeConfig: { defaultLocale: 'zh-CN', supportedLocales: ['zh-CN', 'en-US'] },
      blocks: [{ type: 'paragraph', data: { text: '你好' } }]
    }]
  });

  const search = page.getByTestId('supported-locales-search');
  const defaultLocale = page.getByTestId('page-locale-settings').locator('select').nth(0);
  page.once('dialog', async (dialog) => dialog.dismiss());
  await search.click();
  await search.fill('en-US');
  await page.getByRole('option', { name: '✓ English（en-US）', exact: true }).click();
  await expect(defaultLocale.locator('option')).toHaveCount(2);

  page.once('dialog', async (dialog) => dialog.accept());
  await search.click();
  await search.fill('en-US');
  await page.getByRole('option', { name: '✓ English（en-US）', exact: true }).click();
  await expect(defaultLocale.locator('option')).toHaveCount(1);

  await search.click();
  await search.fill('zh-CN');
  await page.getByRole('option', { name: '✓ 简体中文（zh-CN）', exact: true }).click();
  await expect(defaultLocale.locator('option')).toHaveCount(1);
});
