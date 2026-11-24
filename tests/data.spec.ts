import path from 'node:path';
import { test, expect } from './fixtures/base';

const fixture = (name: string) => path.join(__dirname, 'fixtures', name);

test.describe('Jira CSV로 보정', () => {
  test('필요한 열이 없는 CSV는 계산하지 않고 안내한다', async ({ calc, page }) => {
    await calc.goTab('data');
    await page.locator('#fIss').setInputFiles(fixture('t_bad.csv'));
    await page.locator('#runImp').click();
    await expect(calc.toast).toHaveText('필수 열을 먼저 연결해 주세요');
  });

  test('EUC-KR로 저장된 한글 CSV도 열 이름을 읽고 실측 결과를 낸다', async ({ calc, page }) => {
    await calc.goTab('data');
    await page.locator('#fIss').setInputFiles(fixture('t_kr.csv'));
    await expect(page.locator('#mapIss select[data-m="i.key"]')).toHaveValue('키');
    const map: Record<string, string> = {
      'i.group': '에픽', 'i.cat': '분류', 'i.size': '규모', 'i.phase': '파트',
      'i.started': '시작일', 'i.resolved': '완료일', 'i.spent': '소요 시간',
    };
    for (const [key, col] of Object.entries(map)) {
      await page.locator(`#mapIss select[data-m="${key}"]`).selectOption(col);
    }
    await page.locator('#runImp').click();
    await expect(page.locator('#result')).toContainText('실측 결과');
  });

  test('샘플 데이터로 보정하면 안전 80% 기준을 고를 수 있고 착수가 같거나 빨라진다', async ({ calc, page }) => {
    await calc.goTab('data');
    await page.locator('#sample').click();
    await expect(calc.toast).toContainText('가상 샘플 데이터를 넣었습니다');
    await calc.goTab('calc');
    const seg = page.locator('#varSeg');
    await expect(seg).toBeVisible();
    await seg.locator('button[data-v=p50]').click();
    const p50 = await calc.startDeadline();
    await seg.locator('button[data-v=p80]').click();
    await expect(seg.locator('button[data-v=p80]')).toHaveClass(/on/);
    expect(await calc.startDeadline() <= p50).toBe(true);
  });
});
