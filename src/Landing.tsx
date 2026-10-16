import { useEffect, useRef } from 'react';
import { ArrowRight, ArrowDown, Check, ShieldCheck, MessageCircle, UsersRound } from 'lucide-react';
import { useLandingMotion } from './useLandingMotion';
import './landing.css';

const plans = [
  { name: 'Essencial', price: 27, seats: '1 acesso', description: 'Para começar a aprender e criar.', url: 'https://pay.cakto.com.br/er4g3u6_1199592' },
  { name: 'Completo', price: 77, seats: 'Até 3 acessos', description: 'Mais recursos para a rotina da sua equipe.', url: 'https://pay.cakto.com.br/r8oymyi' },
  { name: 'Avançado', price: 127, seats: 'Até 20 acessos', description: 'Para desenvolver e organizar o ministério.', url: 'https://pay.cakto.com.br/39ri33i' },
];
const planFeatures: Record<string,string[]> = {
  Essencial: ['Curso Canva Evolution', '78 artes editáveis para feed', 'Modelo de identidade visual'],
  Completo: ['Tudo do Essencial', 'Edição de vídeo com CapCut', 'Biblioteca Canva Gospel', 'Legendas, calendário e roteiros', 'Mensagens e comunicação com a liderança'],
  Avançado: ['Tudo do Completo', 'Pack Gospel em PSD', 'Escalas e passagem de tarefas', 'Briefings, checklists e organização', 'Guias de foto, vídeo e transmissão'],
};
const faqs = [
  { question: 'É assinatura ou pagamento único?', answer: 'O pagamento é único, com acesso vitalício aos conteúdos incluídos no plano escolhido. Não há mensalidade da Reino Academy.' },
  { question: 'Como recebo meu acesso?', answer: 'Após a aprovação do pagamento pela Cakto, o acesso é vinculado ao e-mail informado na compra. Use esse mesmo e-mail para criar sua conta ou entrar na plataforma. Se precisar de ajuda com a liberação, fale com o suporte.' },
  { question: 'Preciso ter Canva Pro?', answer: 'Você precisa de uma conta no Canva para editar os modelos. Elementos ou recursos identificados como Pro podem exigir uma licença do Canva. A compra da Reino Academy não inclui uma assinatura Canva Pro.' },
  { question: 'Os cursos têm conteúdo cristão?', answer: 'Os cursos são técnicos e não têm conteúdo especificamente cristão. Eles ensinam ferramentas de criação e edição que você pode aplicar à comunicação da sua igreja. Os packs gospel e os materiais para a equipe são apresentados separadamente, conforme o plano.' },
  { question: 'Como funcionam os acessos da equipe?', answer: 'O Essencial inclui 1 acesso; o Completo, até 3; e o Avançado, até 20. O responsável está incluído nesse limite. Cada integrante usa seu próprio login, e o responsável administra os convites na plataforma.' },
  { question: 'Como abro os modelos do Canva?', answer: 'Abra o link do material usando seu espaço pessoal no Canva. Os links dos modelos podem não abrir dentro de uma equipe. Se estiver em uma equipe, troque para seu espaço pessoal e tente novamente. Confira também as instruções disponíveis no material.' },
  { question: 'Posso acessar pelo celular?', answer: 'Sim. Você pode acessar a plataforma pelo navegador do celular ou do computador. A edição dos materiais depende do aplicativo ou ferramenta correspondente, como Canva ou Photoshop para arquivos PSD.' },
  { question: 'Como solicito suporte ou reembolso?', answer: 'Fale com nosso suporte pelo WhatsApp (53) 99125-7648, informando o e-mail usado na compra. Para solicitar o reembolso dentro da garantia, entre em contato em até 7 dias após a compra.' },
];
const resources = [
  { id: 'cursos', image: '01', label: 'APRENDA', title: 'Cursos técnicos', text: 'Canva Evolution e edição de vídeo com CapCut, conforme o plano escolhido.' },
  { id: 'artes', image: '04', label: 'CRIE', title: 'Artes editáveis', text: 'Modelos para personalizar a comunicação dos cultos, eventos e ministérios.' },
  { id: 'ferramentas', image: '15', label: 'ORGANIZE', title: 'Materiais para a equipe', text: 'Escalas, checklists, mensagens, legendas e outros recursos, conforme o plano.' },
];

export default function Landing() {
  const root = useRef<HTMLDivElement>(null);
  useLandingMotion(root);
  useEffect(() => {
    document.title = 'Reino Academy — Aprenda a comunicar melhor';
    const previous = document.documentElement.style.colorScheme;
    document.documentElement.style.colorScheme = 'dark';
    return () => { document.documentElement.style.colorScheme = previous; };
  }, []);
  const openPlans = () => document.getElementById('planos')?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
  return <div className="lp" ref={root}>
    <a className="lp-skip" href="#conteudo">Pular para o conteúdo</a>
    <div className="lp-bottom-glass" aria-hidden="true"/>
    <section className="lp-hero" aria-labelledby="lp-title">
      <img className="lp-backdrop" src="/banners/lp-hero.webp" alt="" fetchPriority="high" />
      <header className="lp-header">
        <a className="lp-wordmark" href="/" aria-label="Reino Academy, início"><img src="/banners/brand-logo-transparent.png" alt="Reino Academy" width="2172" height="724"/></a>
        <nav aria-label="Navegação da página"><a href="#cursos">Cursos</a><a href="#artes">Artes</a><a href="#ferramentas">Ferramentas</a><span className="lp-student-access"><a className="lp-student-label" href="/login">Já sou aluno</a><a className="lp-login-button" href="/login">Entrar <ArrowRight size={15} aria-hidden="true"/></a></span></nav>
      </header>
      <main className="lp-hero-copy" id="conteudo">
        <p className="lp-hero-kicker"><span aria-hidden="true"/>PARA QUEM SERVE NA MÍDIA</p>
        <h1 id="lp-title">Sua igreja tem uma mensagem.<br/><span>Aprenda a comunicá-la melhor.</span></h1>
        <p>Cursos, artes editáveis e ferramentas para quem serve na mídia da igreja.</p>
        <button className="lp-cta lp-cta-premium" onClick={openPlans}><span>Conhecer os planos</span><ArrowRight size={21} aria-hidden="true"/></button>
        <small>A partir de R$27 <i>·</i> Pagamento único <i>·</i> Garantia de 7 dias</small>
        <a className="lp-discover" href="#recursos">Explore os recursos <ArrowDown size={14} aria-hidden="true"/></a>
      </main>
    </section>
    <div className="lp-story">
    <section id="recursos" className="lp-resources" aria-labelledby="resources-title">
      <div className="lp-section-intro"><p className="lp-eyebrow">O QUE VOCÊ ENCONTRA AQUI</p>
        <h2 id="resources-title">Aprenda as ferramentas.<br/>Tenha recursos para <span>colocar em prática.</span></h2>
        <p>Da criação das artes à organização da equipe, escolha os recursos para o momento da sua igreja.</p>
      </div>
      <div className="lp-resource-grid">{resources.map((resource, index) => <article id={resource.id} className="lp-resource" key={resource.id}>
        <div className="lp-resource-meta" aria-hidden="true"><span>0{index + 1}</span><span>{resource.label}</span></div>
        <div className="lp-resource-media"><img src={`/banners/${resource.image}.webp`} alt="" loading="lazy" decoding="async" width="960" height="540"/></div>
        <h3>{resource.title}</h3><p>{resource.text}</p>
      </article>)}</div>
      <div className="lp-disclaimer"><p>Os cursos são técnicos e não têm conteúdo especificamente cristão.</p><small>Os conteúdos disponíveis variam conforme o plano escolhido.</small></div>
    </section>
    <section className="lp-routine" aria-labelledby="routine-title">
      <div className="lp-routine-copy">
        <p className="lp-eyebrow">NA ROTINA DA SUA MÍDIA</p>
        <h2 id="routine-title">O próximo culto<br/>não precisa<br/><span>começar na<br/>correria.</span></h2>
        <p className="lp-routine-intro">Aprenda, adapte os materiais e organize os próximos passos de quem serve com você.</p>
        <button className="lp-cta" onClick={openPlans}><span>Encontrar meu plano</span><ArrowRight size={22} aria-hidden="true"/></button>
      </div>
      <div className="lp-routine-details">
        <ol className="lp-routine-list">
          <li><span className="lp-step-number" aria-hidden="true">01</span><div><h3>Prepare a comunicação</h3><p>Use artes editáveis e legendas como ponto de partida para divulgar o culto.</p></div></li>
          <li><span className="lp-step-number" aria-hidden="true">02</span><div><h3>Crie com mais segurança</h3><p>Consulte as aulas técnicas de Canva e edição de vídeo para desenvolver suas habilidades.</p></div></li>
          <li><span className="lp-step-number" aria-hidden="true">03</span><div><h3>Organize quem serve</h3><p>Adapte escalas, checklists e mensagens para a rotina da sua equipe.</p></div></li>
        </ol>
        <p className="lp-routine-note">Recursos disponíveis conforme o plano escolhido.</p>
      </div>
    </section>
    <section id="planos" className="lp-pricing" aria-labelledby="pricing-title">
      <div className="lp-section-intro">
        <p className="lp-eyebrow">UM PRÓXIMO PASSO PARA SUA MÍDIA</p>
        <h2 id="pricing-title" tabIndex={-1}>Escolha o <span>próximo passo</span> da sua mídia.</h2>
        <p>Pagamento único. Acesso vitalício. Escolha os recursos para o momento da sua igreja.</p>
      </div>
      <div className="lp-offers">{plans.map(plan => {
        const featured = plan.name === 'Completo';
        return <article className={featured ? 'lp-offer lp-offer-featured' : 'lp-offer'} key={plan.name} aria-labelledby={`offer-${plan.name}`}>
          <div className="lp-offer-label">{featured && <span>PARA SUA EQUIPE</span>}</div>
          <h3 id={`offer-${plan.name}`}>{plan.name}</h3>
          <p className="lp-offer-description">{plan.description}</p>
          <p className="lp-offer-price"><span>R$</span><strong>{plan.price}</strong></p>
          <p className="lp-offer-payment">pagamento único</p>
          <span className="lp-offer-seats"><UsersRound size={15} aria-hidden="true"/>{plan.seats}{plan.name === 'Essencial' ? ' individual' : ' individuais'}</span>
          <ul>{planFeatures[plan.name].map(feature => <li key={feature}><Check size={18} aria-hidden="true"/><span>{feature}</span></li>)}</ul>
          <a className={featured ? 'lp-cta lp-offer-cta lp-cta-premium' : 'lp-cta lp-offer-cta lp-cta-muted'} href={plan.url}><span>Escolher {plan.name}</span><ArrowRight size={18} aria-hidden="true"/></a>
        </article>;
      })}</div>
      <p className="lp-access-note">Os acessos incluem o responsável pela equipe.</p>
      <div className="lp-pricing-trust"><span><ShieldCheck size={22} aria-hidden="true"/>7 dias de garantia</span><a href="https://wa.me/5553991257648" target="_blank" rel="noopener noreferrer"><MessageCircle size={20} aria-hidden="true"/>Precisa de ajuda? Fale com o suporte <ArrowRight size={16} aria-hidden="true"/></a></div>
    </section>
    <section className="lp-guarantee" aria-labelledby="guarantee-title">
      <p className="lp-eyebrow">SUA ESCOLHA COM TRANQUILIDADE</p>
      <div className="lp-guarantee-seal" aria-hidden="true">
        <div className="lp-seal-face"><span className="lp-seal-top">GARANTIA</span><strong>7</strong><span className="lp-seal-days">DIAS</span><span className="lp-seal-bottom">REINO ACADEMY</span></div>
      </div>
      <h2 id="guarantee-title">Conheça por dentro.<br/><span>Você tem 7 dias de garantia.</span></h2>
      <p className="lp-guarantee-intro">Entre na plataforma, explore os conteúdos do seu plano e veja como eles podem ajudar na rotina da sua mídia.</p>
      <p className="lp-guarantee-terms">Se decidir que não é para você, solicite o reembolso em até 7 dias após a compra. Nosso suporte está disponível para orientar você.</p>
      <a className="lp-cta" href="#planos"><span>Escolher meu plano</span><ArrowRight size={20} aria-hidden="true"/></a>
      <a className="lp-guarantee-support" href="https://wa.me/5553991257648" target="_blank" rel="noopener noreferrer">Dúvidas sobre a garantia? Fale com o suporte <ArrowRight size={15} aria-hidden="true"/></a>
    </section>
    <section id="duvidas" className="lp-faq" aria-labelledby="faq-title">
      <div className="lp-section-intro"><p className="lp-eyebrow">ANTES DO SEU PRÓXIMO PASSO</p>
        <h2 id="faq-title">Ainda ficou <span>alguma dúvida?</span></h2>
        <p>Veja o que você precisa saber para começar.</p>
      </div>
      <div className="lp-faq-list">{faqs.map(faq => <details className="lp-faq-item" key={faq.question}>
        <summary>{faq.question}<span className="lp-faq-toggle" aria-hidden="true"/></summary>
        <div className="lp-faq-answer"><p>{faq.answer}</p></div>
      </details>)}</div>
      <p className="lp-faq-support">Não encontrou sua resposta? <a href="https://wa.me/5553991257648" target="_blank" rel="noopener noreferrer">Converse com o suporte <ArrowRight size={14} aria-hidden="true"/></a></p>
    </section>
    <section className="lp-final-cta" aria-labelledby="final-cta-title">
      <p className="lp-eyebrow">APRENDA. CRIE. SIRVA.</p>
      <h2 id="final-cta-title">Seu próximo culto já pode começar<br/><span>com mais preparo.</span></h2>
      <p>Cursos, artes editáveis e materiais para dar o próximo passo na comunicação da sua igreja.</p>
      <button className="lp-cta lp-cta-premium" onClick={openPlans}><span>Escolher meu plano</span><ArrowRight size={20} aria-hidden="true"/></button>
      <small>A partir de R$27 · Pagamento único · 7 dias de garantia</small>
    </section>
    <footer className="lp-footer lp-footer-complete">
      <div className="lp-footer-top"><a className="lp-wordmark" href="/" aria-label="Reino Academy, início"><img src="/banners/brand-logo-transparent.png" alt="Reino Academy" width="2172" height="724"/></a>
        <nav aria-label="Links do rodapé"><a href="#planos">Planos</a><a href="#duvidas">Dúvidas frequentes</a><a href="/login">Acessar minha conta</a><a href="https://wa.me/5553991257648" target="_blank" rel="noopener noreferrer">Suporte <ArrowRight size={14} aria-hidden="true"/></a></nav>
      </div>
      <div className="lp-footer-bottom"><p>© {new Date().getFullYear()} Reino Academy.</p><p>Cursos técnicos e recursos para quem serve na mídia da igreja.</p></div>
    </footer>
    <div className="lp-page-end" aria-hidden="true"/>
    </div>
  </div>;
}
