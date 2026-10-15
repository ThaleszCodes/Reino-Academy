import { test, expect } from '@playwright/test';
test('landing shows resources and functional checkout choices', async ({ page }) => {
  const errors:string[]=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.goto('/lp');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Sua igreja tem uma mensagem.');
  await expect(page.locator('.lp-resource')).toHaveCount(3);
  await expect(page.locator('.lp-disclaimer')).toContainText('não têm conteúdo especificamente cristão');
  await page.getByRole('button', {name:'Conhecer os planos'}).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  for(const [name,url] of [['Essencial','er4g3u6_1199592'],['Completo','r8oymyi'],['Avançado','39ri33i']]) {
    await expect(dialog.getByRole('link',{name:`Escolher ${name}`})).toHaveAttribute('href',`https://pay.cakto.com.br/${url}`);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  await page.screenshot({path:`test-results/lp-${test.info().project.name}.png`,fullPage:true});
});
