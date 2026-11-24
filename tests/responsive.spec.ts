import { test, expect } from './fixtures/base';

test.describe('좁은 화면', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('휴대폰 폭에서도 결론과 일정표가 보이고 가로로 넘치지 않는다', async ({ calc, page }) => {
    await expect(calc.decide).toBeVisible();
    await page.locator('#expandAll').click();
    await expect(page.locator('#gantt')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
