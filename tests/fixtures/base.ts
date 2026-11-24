import { test as base, expect } from '@playwright/test';
import { CalculatorPage } from '../pages/CalculatorPage';

/**
 * 모든 테스트가 같은 날짜에서 시작하도록 시계를 고정한다.
 * 계산기는 오늘을 기준일로 쓰기 때문에, 시계를 고정하지 않으면 실행하는 날마다 결과가 달라진다.
 * 페이지에서 자바스크립트 오류가 나면 테스트를 실패로 처리한다.
 */
export const FIXED_NOW = new Date('2026-11-24T10:00:00+09:00');

type Fixtures = { calc: CalculatorPage };

export const test = base.extend<Fixtures>({
  calc: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.clock.setFixedTime(FIXED_NOW);
    const calc = new CalculatorPage(page);
    await calc.open();
    await use(calc);
    expect(errors, '페이지에서 자바스크립트 오류가 나면 안 된다').toEqual([]);
  },
});

export { expect };
