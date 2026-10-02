"use client";

import { useEffect, useMemo, useState } from "react";
import { Improvement, Method, seedImprovements } from "@/lib/data";

const tones: Record<Method,string> = {Kaizen:"green",A3:"blue",PDCA:"purple"};

export default function PublicBoard() {
  const [items,setItems] = useState<Improvement[]>(seedImprovements);
  const [filter,setFilter] = useState<"Todos"|Method>("Todos");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("espaco-improve-items") || "[]") as Improvement[];
      setItems([...saved,...seedImprovements.filter(seed => !saved.some(item => item.id === seed.id))]);
    } catch {}
  },[]);

  const published = useMemo(() => items.filter(i => i.public && (filter === "Todos" || i.method === filter)),[items,filter]);
  const done = items.filter(i=>i.public && i.status==="Concluído").length;
  const doing = items.filter(i=>i.public && i.status==="Em execução").length;
  const impact = items.filter(i=>i.public).reduce((sum,i)=>sum+i.impact,0);

  return <main className="public-page">
    <header className="public-header">
      <a href="/" className="public-brand"><span>I</span><div><b>Espaço Improve</b><small>Melhoria contínua em movimento</small></div></a>
      <nav><a href="#visao">Visão geral</a><a href="#melhorias">Melhorias</a><a href="/">Área interna ↗</a></nav>
    </header>

    <section className="public-hero" id="visao">
      <div><span>PAINEL PÚBLICO</span><h1>Ideias que viram resultado.</h1><p>Acompanhe as melhorias publicadas, o avanço dos projetos e os ganhos já validados.</p></div>
      <div className="hero-count"><strong>{items.filter(i=>i.public).length}</strong><span>melhorias publicadas</span><small>Transparência com dados liberados</small></div>
    </section>

    <section className="public-stats">
      <PublicStat value={String(done)} label="Concluídas" />
      <PublicStat value={String(doing)} label="Em execução" />
      <PublicStat value={`${Math.round(items.filter(i=>i.public).reduce((s,i)=>s+i.progress,0)/Math.max(1,items.filter(i=>i.public).length))}%`} label="Avanço médio" />
      <PublicStat value={new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(impact)} label="Impacto validado" />
    </section>

    <section className="public-content" id="melhorias">
      <div className="public-section-title"><div><h2>Melhorias em destaque</h2><p>Projetos publicados pelas áreas</p></div><div className="filter-row">{(["Todos","Kaizen","A3","PDCA"] as const).map(f=><button key={f} className={filter===f?"active":""} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>
      <div className="public-cards">
        {published.map(item=><article className="public-card" key={item.id}>
          <div className="card-top"><span className={`type-chip ${tones[item.method]}`}>{item.method}</span><small>{item.area}</small></div>
          <h3>{item.title}</h3>
          <p>{item.objective}</p>
          <div className="public-progress-label"><span>Progresso</span><b>{item.progress}%</b></div>
          <div className="progress"><i className={tones[item.method]} style={{width:`${item.progress}%`}} /></div>
          <div className="public-card-meta"><span>Responsável: {item.owner}</span><span>{item.status}</span></div>
        </article>)}
      </div>
    </section>

    <section className="public-banner"><div><span>CULTURA DE MELHORIA</span><h2>Transparência para reconhecer quem melhora o processo.</h2><p>O painel mostra somente iniciativas liberadas para visualização pública.</p></div><a href="/">Abrir área interna</a></section>
  </main>;
}

function PublicStat({value,label}:{value:string;label:string}) {
  return <div className="public-stat"><strong>{value}</strong><span>{label}</span></div>;
}
