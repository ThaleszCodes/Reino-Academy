import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
const App = React.lazy(() => import('./App'));
const Landing = React.lazy(() => import('./Landing'));
import './styles.css';
class Boundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?<main className="full-state"><h1>Vamos tentar novamente?</h1><p>Não foi possível abrir esta tela.</p><button onClick={()=>location.reload()}>Recarregar</button></main>:this.props.children}}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Boundary><React.Suspense fallback={<div role="status" style={{padding:24}}>Carregando…</div>}><BrowserRouter>{/^\/lp\/?$/.test(location.pathname) ? <Landing/> : <App/>}</BrowserRouter></React.Suspense></Boundary></React.StrictMode>);
