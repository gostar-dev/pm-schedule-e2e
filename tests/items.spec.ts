import { test, expect } from './fixtures/base';

test.describe('콘텐츠 목록', () => {
  test('콘텐츠를 추가하면 일정표에도 새 줄이 생긴다', async ({ calc }) => {
    await expect(calc.items).toHaveCount(2);
    await calc.addItem();
    await expect(calc.items).toHaveCount(3);
    await expect.poll(() => calc.detailItems()).toHaveLength(3);
    expect((await calc.detailItems())[2]).toMatch(/^3\. /);
  });

  test('콘텐츠를 지우면 일정표에서도 빠진다', async ({ calc }) => {
    await calc.deleteItem(1);
    await expect(calc.items).toHaveCount(1);
    await expect.poll(() => calc.detailItems()).toEqual(['1. 기능·M']);
  });

  test('규모를 M에서 L로 키우면 기획 기간이 늘고 착수 마감일이 앞당겨진다', async ({ calc }) => {
    const before = await calc.phaseDates(1, '기획');
    const deadline = await calc.startDeadline();
    await calc.setSize(0, 'L');
    await expect(calc.detail).toContainText('기능·L');
    const after = await calc.phaseDates(1, '기획');
    expect(after.days).toBeGreaterThan(before.days);
    expect(await calc.startDeadline() < deadline).toBe(true);
  });
});
