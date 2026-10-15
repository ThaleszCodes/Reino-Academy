import { test, expect } from '@playwright/test';
test('landing shows resources and functional checkout choices', async ({ page }) => {
  const errors:string[]=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Sua igreja tem uma mensagem.');
  await expect(page.locator('.lp-resource')).toHaveCount(3);
  await expect(page.locator('.lp-disclaimer')).toContainText('não têm conteúdo especificamente cristão');
  await page.getByRole('button', {name:'Conhecer os planos'}).click();
  const dialog=page.locator('#planos');
  await expect(dialog).toBeInViewport();
  for(const [name,url] of [['Essencial','er4g3u6_1199592'],['Completo','r8oymyi'],['Avançado','39ri33i']]) {
    await expect(dialog.getByRole('link',{name:`Escolher ${name}`})).toHaveAttribute('href',`https://pay.cakto.com.br/${url}`);
  }

  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  await page.screenshot({path:`test-results/lp-${test.info().project.name}.png`,fullPage:true});
});

test('previous LP address still opens the public page', async ({page}) => {
  await page.goto('/lp');
  await expect(page.getByRole('heading',{level:1})).toContainText('Sua igreja tem uma mensagem.');
});
test('old invitation URLs still enter the platform', async ({page}) => {
  await page.goto('/?convite=legacy-test');
  await expect(page).toHaveURL(/\/login\?convite=legacy-test/);
  await expect(page.getByRole('button',{name:'Entrar',exact:true})).toBeVisible();
});

test('routine section shares continuous atmosphere and opens checkout choices', async ({page},info) => {
  await page.goto('/');
  const routine=page.getByRole('region',{name:'O próximo culto não precisa começar na correria.'});
  await expect(routine).toBeVisible();
  await expect(routine.getByRole('listitem')).toHaveCount(3);
  await routine.getByRole('button',{name:'Encontrar meu plano'}).click();
  await expect(page.locator('#planos')).toBeInViewport();
  const continuity=await page.evaluate(()=>{
    const story=document.querySelector('.lp-story')!;
    const resources=document.querySelector('.lp-resources')!;
    const section=document.querySelector('.lp-routine')!;
    return {
      shared:resources.parentElement===story && section.parentElement===story,
      resources:getComputedStyle(resources).backgroundColor,
      section:getComputedStyle(section).backgroundColor,
      glow:getComputedStyle(section,'::before').backgroundImage,
      horizontalOverflow:document.documentElement.scrollWidth>innerWidth
    };
  });
  expect(continuity.shared).toBe(true);
  expect(continuity.resources).toBe('rgba(0, 0, 0, 0)');
  expect(continuity.section).toBe('rgba(0, 0, 0, 0)');
  expect(continuity.glow).toContain('radial-gradient');
  expect(continuity.horizontalOverflow).toBe(false);
  await page.evaluate(()=>window.scrollTo(0,document.querySelector('.lp-routine')!.getBoundingClientRect().top+scrollY-230));
  await page.screenshot({path:info.outputPath('section-2-3-continuity.png')});
});

test('pricing has continuous fold, working offers and accessible premium reflection', async ({page},info)=>{
  await page.goto('/#planos');
  const pricing=page.locator('#planos');
  await expect(pricing.getByRole('article')).toHaveCount(3);
  const premium=pricing.getByRole('link',{name:'Escolher Completo'});
  await expect(premium).toHaveAttribute('href','https://pay.cakto.com.br/r8oymyi');
  const effect=await premium.evaluate(el=>({shadow:getComputedStyle(el).boxShadow,animation:getComputedStyle(el,'::after').animationName}));
  expect(effect.shadow).not.toBe('none');
  expect(effect.animation).toBe('lp-button-reflection');
  expect(await pricing.evaluate(el=>el.parentElement===document.querySelector('.lp-routine')!.parentElement)).toBe(true);
  expect(await pricing.evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  await page.emulateMedia({reducedMotion:'reduce'});
  expect(await premium.evaluate(el=>getComputedStyle(el,'::after').animationName)).toBe('none');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await pricing.scrollIntoViewIfNeeded();
  await page.screenshot({path:info.outputPath('pricing-section.png'),fullPage:true,animations:'disabled'});
});
