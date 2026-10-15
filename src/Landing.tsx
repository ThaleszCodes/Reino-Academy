import { useEffect, useRef } from 'react';
import { ArrowRight, X } from 'lucide-react';
import './landing.css';

const plans = [
  { name: 'Essencial', price: 27, seats: '1 acesso', description: 'Para começar a aprender e criar.', url: 'https://pay.cakto.com.br/er4g3u6_1199592' },
  { name: 'Completo', price: 77, seats: 'Até 3 acessos', description: 'Mais recursos para a rotina da sua equipe.', url: 'https://pay.cakto.com.br/r8oymyi' },
  { name: 'Avançado', price: 127, seats: 'Até 20 acessos', description: 'Para desenvolver e organizar o ministério.', url: 'https://pay.cakto.com.br/39ri33i' },
];
const resources = [
  { id: 'cursos', image: '01', title: 'Cursos técnicos', text: 'Canva Evolution e edição de vídeo com CapCut, conforme o plano escolhido.' },
  { id: 'artes', image: '04', title: 'Artes editáveis', text: 'Modelos para personalizar a comunicação dos cultos, eventos e ministérios.' },
  { id: 'ferramentas', image: '15', title: 'Materiais para a equipe', text: 'Escalas, checklists, mensagens, legendas e outros recursos, conforme o plano.' },
];

export default function Landing() {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    document.title = 'Reino Academy — Aprenda a comunicar melhor';
    const previous = document.documentElement.style.colorScheme;
    document.documentElement.style.colorScheme = 'dark';
    return () => { document.documentElement.style.colorScheme = previous; };
  }, []);
  const openPlans = () => dialog.current?.showModal();
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
    <footer className="lp-footer"><span>REINO ACADEMY</span><a href="https://wa.me/5553991257648" target="_blank" rel="noopener noreferrer">Falar com o suporte <ArrowRight size={15}/></a></footer>
    <dialog ref={dialog} className="lp-plans" aria-labelledby="plans-title" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <button className="lp-close" aria-label="Fechar planos" onClick={() => dialog.current?.close()}><X size={22}/></button>
      <p className="lp-eyebrow">ESCOLHA SEU PRÓXIMO PASSO</p><h2 id="plans-title">Um investimento. Acesso vitalício.</h2>
      <p className="lp-plan-intro">Pagamento único e 7 dias de garantia. Confira todos os detalhes da oferta no checkout.</p>
      <div className="lp-plan-grid">{plans.map(plan => <article key={plan.name}><h3>{plan.name}</h3><p>{plan.description}</p><strong><small>R$</small>{plan.price}</strong><span>{plan.seats}</span><a className="lp-cta" href={plan.url}>Escolher {plan.name} <ArrowRight size={17}/></a></article>)}</div>
    </dialog>
  </div>;
}
