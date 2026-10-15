import { useEffect } from 'react';
import { ArrowRight, Check, ShieldCheck, MessageCircle } from 'lucide-react';
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
const resources = [
  { id: 'cursos', image: '01', title: 'Cursos técnicos', text: 'Canva Evolution e edição de vídeo com CapCut, conforme o plano escolhido.' },
  { id: 'artes', image: '04', title: 'Artes editáveis', text: 'Modelos para personalizar a comunicação dos cultos, eventos e ministérios.' },
  { id: 'ferramentas', image: '15', title: 'Materiais para a equipe', text: 'Escalas, checklists, mensagens, legendas e outros recursos, conforme o plano.' },
];

export default function Landing() {
  useEffect(() => {
    document.title = 'Reino Academy — Aprenda a comunicar melhor';
    const previous = document.documentElement.style.colorScheme;
    document.documentElement.style.colorScheme = 'dark';
    return () => { document.documentElement.style.colorScheme = previous; };
  }, []);
  const openPlans = () => document.getElementById('planos')?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
  return <div className="lp">
    <a className="lp-skip" href="#conteudo">Pular para o conteúdo</a>
    <section className="lp-hero" aria-labelledby="lp-title">
      <img className="lp-backdrop" src="/banners/lp-hero.webp" alt="" fetchPriority="high" />
      <header className="lp-header">
        <a className="lp-wordmark" href="/" aria-label="Reino Academy, início">REINO<span>ACADEMY</span></a>
        <nav aria-label="Navegação da página"><a href="#cursos">Cursos</a><a href="#artes">Artes</a><a href="#ferramentas">Ferramentas</a><a href="/login">Já sou aluno <ArrowRight size={14}/></a></nav>
      </header>
      <main className="lp-hero-copy" id="conteudo">
        <h1 id="lp-title">Sua igreja tem uma mensagem.<br/><span>Aprenda a comunicá-la melhor.</span></h1>
        <p>Cursos, artes editáveis e ferramentas para quem serve na mídia da igreja.</p>
        <button className="lp-cta" onClick={openPlans}>Conhecer os planos <ArrowRight size={21}/></button>
        <small>A partir de R$27 <i>·</i> Pagamento único <i>·</i> Garantia de 7 dias</small>
      </main>
    </section>
    <div className="lp-story">
    <section className="lp-resources" aria-labelledby="resources-title">
      <div className="lp-section-intro"><p className="lp-eyebrow">O QUE VOCÊ ENCONTRA AQUI</p>
        <h2 id="resources-title">Aprenda as ferramentas.<br/>Tenha recursos para <span>colocar em prática.</span></h2>
        <p>Da criação das artes à organização da equipe, escolha os recursos para o momento da sua igreja.</p>
      </div>
      <div className="lp-resource-grid">{resources.map(resource => <article id={resource.id} className="lp-resource" key={resource.id}>
        <img src={`/banners/${resource.image}.webp`} alt="" loading="lazy" width="960" height="540"/>
        <h3>{resource.title}</h3><p>{resource.text}</p>
      </article>)}</div>
      <div className="lp-disclaimer"><p>Os cursos são técnicos e não têm conteúdo especificamente cristão.</p><small>Os conteúdos disponíveis variam conforme o plano escolhido.</small></div>
    </section>
    <section className="lp-routine" aria-labelledby="routine-title">
      <div className="lp-routine-copy">
        <p className="lp-eyebrow">NA ROTINA DA SUA MÍDIA</p>
        <h2 id="routine-title">O próximo culto<br/>não precisa<br/><span>começar na<br/>correria.</span></h2>
        <p className="lp-routine-intro">Aprenda, adapte os materiais e organize os próximos passos de quem serve com você.</p>
        <button className="lp-cta" onClick={openPlans}>Encontrar meu plano <ArrowRight size={22}/></button>
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
          <span className="lp-offer-seats">{plan.seats}{plan.name === 'Essencial' ? ' individual' : ' individuais'}</span>
          <ul>{planFeatures[plan.name].map(feature => <li key={feature}><Check size={18} aria-hidden="true"/><span>{feature}</span></li>)}</ul>
          <a className={featured ? 'lp-cta lp-offer-cta lp-cta-premium' : 'lp-cta lp-offer-cta lp-cta-muted'} href={plan.url}><span>Escolher {plan.name}</span></a>
        </article>;
      })}</div>
      <p className="lp-access-note">Os acessos incluem o responsável pela equipe.</p>
      <div className="lp-pricing-trust"><span><ShieldCheck size={22} aria-hidden="true"/>7 dias de garantia</span><a href="https://wa.me/5553991257648" target="_blank" rel="noopener noreferrer"><MessageCircle size={20} aria-hidden="true"/>Precisa de ajuda? Fale com o suporte <ArrowRight size={16} aria-hidden="true"/></a></div>
    </section>
    <footer className="lp-footer"><span>REINO ACADEMY</span><a href="https://wa.me/5553991257648" target="_blank" rel="noopener noreferrer">Falar com o suporte <ArrowRight size={15}/></a></footer>
    </div>
  </div>;
}
