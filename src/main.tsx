import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
const App = React.lazy(() => import('./App'));
const PostPayment = React.lazy(() => import('./PostPayment'));
const Landing = React.lazy(() => import('./Landing'));
import './styles.css';
class Boundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?<main className="full-state"><h1>Vamos tentar novamente?</h1><p>Não foi possível abrir esta tela.</p><button onClick={()=>location.reload()}>Recarregar</button></main>:this.props.children}}
// Keep existing invitation and authentication links working after moving the public page.
if (location.pathname === '/' && (new URLSearchParams(location.search).has('convite') || /(?:access_token|refresh_token|error_description)=/.test(location.hash) || new URLSearchParams(location.search).has('code'))) {
  history.replaceState(null, '', '/login' + location.search + location.hash);
}
function SiteRoutes(){const {pathname}=useLocation();return /^\/obrigado\/?$/i.test(pathname) ? <PostPayment/> : pathname==='/' || /^\/lp\/?$/i.test(pathname) ? <Landing/> : <App/>;}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Boundary><React.Suspense fallback={<div role="status" style={{padding:24}}>Carregando…</div>}><BrowserRouter><SiteRoutes/></BrowserRouter></React.Suspense></Boundary></React.StrictMode>);
