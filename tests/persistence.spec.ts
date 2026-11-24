import { test, expect } from './fixtures/base';

test.describe('저장과 불러오기', () => {
  test('새로고침해도 바꾼 배포일이 그대로 남는다', async ({ calc, page }) => {
    await calc.setDeploy('2027-03-25');
    await expect(calc.decide).toContainText('2027년 3월 25일');
    await page.reload();
    await expect(calc.deploy).toHaveValue('2027-03-25');
    await expect(calc.decide).toContainText('2027년 3월 25일');
  });

  test('설정을 JSON으로 내보냈다가 다시 불러오면 같은 값이 돌아온다', async ({ calc, page }) => {
    await calc.goTab('set');
    const name = page.locator('#sName');
    await name.fill('왕복 테스트');
    await name.dispatchEvent('input');
    const saved = await calc.savedState();
    const json = JSON.stringify({ app: 'pm-start-calc', v: 1, project: saved.project, plan: saved.plan });

    await calc.resetAll();
    await expect(name).not.toHaveValue('왕복 테스트');
    await calc.importJson(json);
    await expect(calc.toast).toHaveText('설정을 불러왔습니다');
    await expect(name).toHaveValue('왕복 테스트');
  });

  test('이 계산기 형식이 아닌 JSON은 불러오지 않는다', async ({ calc }) => {
    await calc.goTab('set');
    await calc.importJson('{"x":1}');
    await expect(calc.toast).toHaveText('이 계산기에서 복사한 설정 JSON이 아닙니다');
  });
});
