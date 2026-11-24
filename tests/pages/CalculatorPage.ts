import { expect, type Locator, type Page } from '@playwright/test';

export type Tab = 'calc' | 'set' | 'data' | 'how';

/**
 * 계산기 화면의 요소와 동작을 한곳에 모은 페이지 객체.
 * 화면 구조가 바뀌면 이 파일만 고치면 되도록 테스트 파일에는 선택자를 쓰지 않는다.
 */
export class CalculatorPage {
  readonly page: Page;
  readonly decide: Locator;
  readonly kpis: Locator;
  readonly detail: Locator;
  readonly items: Locator;
  readonly toast: Locator;
  readonly deploy: Locator;
  readonly phaseRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.decide = page.locator('#decide');
    this.kpis = page.locator('#kpis');
    this.detail = page.locator('#detail');
    this.items = page.locator('#items .citem');
    this.toast = page.locator('#toast');
    this.deploy = page.locator('#deploy');
    this.phaseRows = page.locator('#phases tr');
  }

  async open() {
    await this.page.goto('/');
    await expect(this.decide).toContainText('결론');
  }

  async goTab(tab: Tab) {
    await this.page.locator(`#mainTabs button[data-t=${tab}]`).click();
    await expect(this.page.locator(`#t-${tab}`)).toBeVisible();
  }

  async setDeploy(date: string) {
    await this.deploy.fill(date);
    await this.deploy.dispatchEvent('change');
  }

  async addItem() {
    await this.page.locator('#addItem').click();
  }

  async deleteItem(index: number) {
    await this.page.locator(`#items button[data-del="${index}"]`).click();
  }

  async setSize(index: number, size: 'S' | 'M' | 'L') {
    await this.page.locator(`#items button[data-i="${index}"][data-size="${size}"]`).click();
  }

  /** 결론 문장에서 착수 마감일(예: 2027년 1월 21일)을 꺼낸다. */
  async startDeadline(): Promise<string> {
    const text = await this.decide.innerText();
    const m = text.match(/(\d{4})년 (\d{1,2})월 (\d{1,2})일 \S+까지 기획에 착수/);
    if (!m) throw new Error(`결론 문장에서 착수일을 찾지 못함: ${text}`);
    return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  }

  /** 결론의 남은 근무일 숫자. 늦은 경우에는 음수로 돌려준다. */
  async workdaysLeft(): Promise<number> {
    const text = await this.decide.innerText();
    const late = text.match(/근무일 (\d+)일 늦었습니다/);
    if (late) return -Number(late[1]);
    const left = text.match(/근무일 (\d+)일 남았습니다/);
    if (left) return Number(left[1]);
    if (text.includes('오늘 착수해야 합니다')) return 0;
    throw new Error(`남은 근무일을 찾지 못함: ${text}`);
  }

  /** 상세 일정표에서 특정 콘텐츠 번호와 단계 이름의 시작일, 종료일을 읽는다. */
  async phaseDates(itemNo: number, phase: string) {
    const rows = await this.detail.locator('tr').allInnerTexts();
    let current = 0;
    for (const row of rows) {
      const cells = row.split('\t').map((c) => c.trim());
      const no = cells[0].match(/^(\d+)\./);
      if (no) current = Number(no[1]);
      if (current === itemNo && cells[1] === phase) return { start: cells[2], end: cells[3], days: Number(cells[4]) };
    }
    throw new Error(`${itemNo}번 콘텐츠의 ${phase} 단계를 찾지 못함`);
  }

  /** 상세 일정표에 나온 콘텐츠 이름 목록 (예: 1. 기능·M). 날짜 속 숫자와 헷갈리지 않게 첫 칸만 본다. */
  async detailItems(): Promise<string[]> {
    const firstCells = await this.detail.locator('tr td:first-child').allInnerTexts();
    return firstCells.map((c) => c.trim()).filter((c) => /^\d+\./.test(c));
  }

  async resetAll() {
    await this.page.locator('#resetAll').click();
    await this.page.locator('#resetYes').click();
  }

  async importJson(text: string) {
    await this.page.locator('#importJ').click();
    await this.page.locator('#importBox').fill(text);
    await this.page.locator('#importOk').click();
  }

  /** 앱이 브라우저에 저장한 상태를 그대로 읽는다. */
  async savedState(): Promise<any> {
    return this.page.evaluate(() => JSON.parse(localStorage.getItem('pm-start-calc-v1') || 'null'));
  }
}
