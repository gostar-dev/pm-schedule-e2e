import { test, expect } from './fixtures/base';

test.describe('착수일 역산', () => {
  test('기본 설정이면 2027-01-21까지 착수해야 하고 근무일 40일이 남는다', async ({ calc }) => {
    expect(await calc.startDeadline()).toBe('2027-01-21');
    expect(await calc.workdaysLeft()).toBe(40);
    await expect(calc.kpis).toContainText('기준일 11/24(화)');
  });

  test('설 연휴(2027-02-08, 02-09)는 근무일에서 빠진다', async ({ calc }) => {
    const review = await calc.phaseDates(1, '기획 검수');
    const dev = await calc.phaseDates(1, '개발');
    expect(review.end).toContain('27.2.5');
    expect(dev.start).toContain('27.2.10');
  });

  test('배포일을 미루면 착수 마감일도 늦어지고 남은 근무일이 늘어난다', async ({ calc }) => {
    const before = await calc.startDeadline();
    await calc.setDeploy('2027-03-25');
    await expect(calc.decide).toContainText('2027년 3월 25일');
    expect(await calc.startDeadline() > before).toBe(true);
    expect(await calc.workdaysLeft()).toBeGreaterThan(40);
  });

  test('배포일까지 시간이 모자라면 몇 근무일 늦었는지 알려 준다', async ({ calc }) => {
    await calc.setDeploy('2026-12-01');
    await expect(calc.decide).toContainText('늦었습니다');
    expect(await calc.workdaysLeft()).toBeLessThan(0);
  });

  test('공휴일 목록이 없는 해를 고르면 경고를 보여 준다', async ({ calc }) => {
    await calc.setDeploy('2028-03-02');
    await expect(calc.decide).toContainText('2028년 공휴일은 아직 들어 있지 않습니다');
  });
});
