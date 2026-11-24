import { test, expect } from './fixtures/base';

test.describe('설정', () => {
  test('인원에 0을 넣으면 막고 이전 값으로 되돌린다', async ({ calc, page }) => {
    await calc.goTab('set');
    const heads = page.locator('#roles input[data-k=heads]').first();
    const original = await heads.inputValue();
    await heads.fill('0');
    await heads.dispatchEvent('change');
    await expect(calc.toast).toHaveText('0보다 큰 값을 넣어 주세요');
    await expect(heads).toHaveValue(original);
  });

  test('새 단계를 추가하면 계산 결과의 일정표에 나타난다', async ({ calc, page }) => {
    await calc.goTab('set');
    await page.locator('#addPhase').click();
    await calc.goTab('calc');
    await expect(calc.detail).toContainText('새 단계');
  });

  test('마지막 남은 순차 단계는 병행으로 바꿀 수 없다', async ({ calc, page }) => {
    await calc.goTab('set');
    const deletable = page.locator('#phases button[data-pdel]:not([disabled])');
    while (await deletable.count()) await deletable.first().click();
    const type = page.locator('#phases select[data-k=type]').first();
    await type.selectOption('par');
    await expect(type).toHaveValue('seq');
  });

  test('기본값 되돌리기를 하면 단계 구성이 처음 상태로 돌아온다', async ({ calc, page }) => {
    await calc.goTab('set');
    const original = await calc.phaseRows.count();
    await page.locator('#addPhase').click();
    await expect(calc.phaseRows).toHaveCount(original + 1);
    await calc.resetAll();
    await expect(calc.toast).toHaveText('기본 설정으로 되돌렸습니다');
    await expect(calc.phaseRows).toHaveCount(original);
  });
});
