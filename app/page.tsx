"use client";

import { useEffect, useMemo, useState } from "react";
import { Improvement, Method, methodPrefix, seedImprovements } from "@/lib/data";

type View = "dashboard" | "new" | "list";

const methodMeta: Record<Method, { className: string; description: string; subtitle: string }> = {
  Kaizen: { className: "green", subtitle: "Melhoria rápida", description: "Para ganhos práticos com ação direta." },
  A3: { className: "blue", subtitle: "Problema estruturado", description: "Para causa raiz, contramedidas e acompanhamento." },
  PDCA: { className: "purple", subtitle: "Ciclo contínuo", description: "Para testar, medir e padronizar uma melhoria." }
};

const initialForm = {
  method: "Kaizen" as Method,
  title: "",
  problem: "",
  objective: "",
  area: "Serviços",
  owner: "",
  deadline: "",
  baseline: "",
  target: "",
  public: true
};

function loadItems() {
  if (typeof window === "undefined") return seedImprovements;
  try {
    const saved = JSON.parse(localStorage.getItem("espaco-improve-items") || "[]") as Improvement[];
    return [...saved, ...seedImprovements.filter(seed => !saved.some(item => item.id === seed.id))];
  } catch {
    return seedImprovements;
  }
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [items, setItems] = useState<Improvement[]>(seedImprovements);
  const [form, setForm] = useState(initialForm);
  const [saved, setSaved] = useState(false);

  useEffect(() => setItems(loadItems()), []);

  const stats = useMemo(() => ({
    open: items.filter(i => i.status !== "Concluído").length,
    doing: items.filter(i => i.status === "Em execução").length,
    done: items.filter(i => i.status === "Concluído").length,
    impact: items.reduce((sum, i) => sum + i.impact, 0)
  }), [items]);

  const completeness = useMemo(() => {
    const required = [form.title, form.problem, form.objective, form.area, form.owner, form.deadline];
    return Math.round((required.filter(Boolean).length / required.length) * 100);
  }, [form]);

  function persist(next: Improvement[]) {
    setItems(next);
    localStorage.setItem("espaco-improve-items", JSON.stringify(next));
  }

  function createImprovement() {
    if (!form.title || !form.problem || !form.objective || !form.owner) return;
    const seq = items.filter(i => i.method === form.method).length + 27;
    const improvement: Improvement = {
      id: `${methodPrefix[form.method]}-${String(seq).padStart(3, "0")}`,
      method: form.method,
      title: form.title,
      area: form.area,
      owner: form.owner,
      problem: form.problem,
      objective: form.objective,
      status: "Enviado",
      progress: 20,
      public: form.public,
      deadline: form.deadline || "A definir",
      baseline: form.baseline || "A medir",
      target: form.target || "A definir",
      impact: 0,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    const next = [improvement, ...items.filter(i => i.id !== improvement.id)];
    persist(next);
    setSaved(true);
    setForm(initialForm);
    window.setTimeout(() => {
      setSaved(false);
      setView("dashboard");
    }, 700);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">I</div>
          <div><strong>Improve</strong><span>Excelência contínua</span></div>
        </div>

        <nav>
          <button className={view === "dashboard" ? "nav-active" : ""} onClick={() => setView("dashboard")}>Visão geral</button>
          <button className={view === "list" ? "nav-active" : ""} onClick={() => setView("list")}>Melhorias</button>
          <button className={view === "new" ? "nav-active" : ""} onClick={() => setView("new")}>Nova melhoria</button>
          <a href="/public">Painel público ↗</a>
        </nav>

        <div className="sidebar-footer">
          <span>ESPAÇO IMPROVE</span>
          <strong>Gestão Lean</strong>
          <small>Kaizen · A3 · PDCA</small>
        </div>
      </aside>

      <main className="main">
        {view === "dashboard" && (
          <>
            <header className="page-header">
              <div><h1>Visão geral</h1><p>Acompanhe o portfólio de melhorias sem perder o foco no resultado.</p></div>
              <button className="primary" onClick={() => setView("new")}>+ Nova melhoria</button>
            </header>

            <section className="stats-grid">
              <Stat label="Melhorias abertas" value={String(stats.open)} note="Portfólio ativo" tone="green" />
              <Stat label="Em execução" value={String(stats.doing)} note="Ações acontecendo" tone="blue" />
              <Stat label="Concluídas" value={String(stats.done)} note="Resultado validado" tone="purple" />
              <Stat label="Impacto validado" value={currency(stats.impact)} note="Ganhos registrados" tone="amber" />
            </section>

            <section className="dashboard-grid">
              <div className="panel span-2">
                <div className="panel-title"><div><h2>Melhorias em andamento</h2><p>Prioridade, etapa atual e próxima ação</p></div><button className="ghost" onClick={() => setView("list")}>Ver lista</button></div>
                <div className="improvement-list">
                  {items.slice(0, 5).map(item => <ImprovementRow key={item.id} item={item} />)}
                </div>
              </div>

              <div className="panel">
                <div className="panel-title"><div><h2>Portfólio por método</h2><p>Distribuição atual</p></div></div>
                {(["Kaizen","A3","PDCA"] as Method[]).map(method => {
                  const count = items.filter(i => i.method === method).length;
                  const pct = items.length ? Math.round((count / items.length) * 100) : 0;
                  return <div className="method-line" key={method}><div><span>{method}</span><b>{pct}%</b></div><div className="progress"><i className={methodMeta[method].className} style={{width:`${pct}%`}} /></div></div>
                })}
              </div>

              <div className="panel span-2">
                <div className="panel-title"><div><h2>Fluxo de abertura</h2><p>Um processo simples do problema ao resultado</p></div></div>
                <div className="flow">
                  {["Rascunho","Enviado","Aprovado","Em execução","Verificação","Concluído"].map((stage, index) => <div key={stage}><span>{index + 1}</span><b>{stage}</b></div>)}
                </div>
              </div>

              <div className="quick-panel">
                <span>ABERTURA RÁPIDA</span>
                <h2>Comece pelo problema.</h2>
                <p>O método e o roteiro se adaptam ao que você preencher.</p>
                <button className="primary wide" onClick={() => setView("new")}>Criar melhoria</button>
              </div>
            </section>
          </>
        )}

        {view === "new" && (
          <>
            <header className="page-header">
              <div><h1>Nova melhoria</h1><p>Um roteiro curto. O conteúdo preenchido já vira o resumo executivo.</p></div>
              <button className="secondary" onClick={() => setView("dashboard")}>Cancelar</button>
            </header>

            <div className="new-grid">
              <section className="form-side">
                <div className="step"><span>PASSO 1 DE 4</span><h2>Qual melhoria você quer abrir?</h2><p>Escolha o método. Você pode trocar depois sem perder o que já preencheu.</p></div>
                <div className="method-cards">
                  {(["Kaizen","A3","PDCA"] as Method[]).map(method => (
                    <button key={method} className={`method-card ${form.method === method ? "selected" : ""} ${methodMeta[method].className}`} onClick={() => setForm(v => ({...v, method}))}>
                      <b>{method}</b><strong>{methodMeta[method].subtitle}</strong><span>{methodMeta[method].description}</span>
                    </button>
                  ))}
                </div>

                <div className="form-panel">
                  <div className="panel-title"><div><h2>Conte o essencial</h2><p>Sem termos técnicos obrigatórios.</p></div></div>
                  <Field label="Título da melhoria" value={form.title} placeholder="Ex.: Inspeção 150h em máquinas novas" onChange={title => setForm(v => ({...v,title}))} />
                  <Field label="Qual problema acontece hoje?" value={form.problem} placeholder="Descreva o que está acontecendo em 2 ou 3 frases." multiline onChange={problem => setForm(v => ({...v,problem}))} />
                  <Field label="O que você quer alcançar?" value={form.objective} placeholder="Descreva o resultado esperado." multiline onChange={objective => setForm(v => ({...v,objective}))} />

                  <div className="field-grid">
                    <Field label="Área" value={form.area} placeholder="Serviços" onChange={area => setForm(v => ({...v,area}))} />
                    <Field label="Responsável" value={form.owner} placeholder="Nome" onChange={owner => setForm(v => ({...v,owner}))} />
                    <Field label="Prazo" value={form.deadline} placeholder="30/10/2026" onChange={deadline => setForm(v => ({...v,deadline}))} />
                    <Field label="Situação inicial" value={form.baseline} placeholder="Ex.: 0%" onChange={baseline => setForm(v => ({...v,baseline}))} />
                    <Field label="Meta" value={form.target} placeholder="Ex.: 95%" onChange={target => setForm(v => ({...v,target}))} />
                    <label className="public-check"><input type="checkbox" checked={form.public} onChange={e => setForm(v => ({...v,public:e.target.checked}))}/><span><b>Exibir no painel público</b><small>Somente dados desta melhoria.</small></span></label>
                  </div>

                  <div className="form-actions">
                    <span>Preenchimento salvo no resultado ao vivo</span>
                    <button className="primary" onClick={createImprovement}>{saved ? "Criado!" : "Enviar melhoria →"}</button>
                  </div>
                </div>
              </section>

              <aside className="live-preview">
                <span className="preview-tag">PRÉVIA AO VIVO</span>
                <small>{methodPrefix[form.method]}-NOVO</small>
                <h2>{form.title || "Sua melhoria ganha forma enquanto você preenche"}</h2>
                <p className="preview-method">{form.method} · {form.area || "Área"}</p>
                <hr />
                <label>PROBLEMA</label>
                <p>{form.problem || "O problema atual aparecerá aqui de forma clara e objetiva."}</p>
                <label>OBJETIVO</label>
                <p>{form.objective || "O resultado esperado aparecerá aqui."}</p>
                <div className="preview-progress">
                  <div><label>COMPLETUDE</label><b>{completeness}%</b></div>
                  <div className="progress dark"><i style={{width:`${completeness}%`}} /></div>
                </div>
                <small>Essa prévia vira a capa da melhoria e alimenta os painéis após o envio.</small>
              </aside>
            </div>
          </>
        )}

        {view === "list" && (
          <>
            <header className="page-header">
              <div><h1>Melhorias</h1><p>Todos os Kaizens, A3 e PDCAs em um só lugar.</p></div>
              <button className="primary" onClick={() => setView("new")}>+ Nova melhoria</button>
            </header>
            <section className="panel table-panel">
              <div className="table-head"><span>ID</span><span>Melhoria</span><span>Área</span><span>Status</span><span>Avanço</span><span>Responsável</span></div>
              {items.map(item => <div className="table-row" key={item.id}>
                <b>{item.id}</b>
                <div><span className={`type-chip ${methodMeta[item.method].className}`}>{item.method}</span><strong>{item.title}</strong></div>
                <span>{item.area}</span>
                <span>{item.status}</span>
                <div className="inline-progress"><div className="progress"><i className={methodMeta[item.method].className} style={{width:`${item.progress}%`}} /></div><b>{item.progress}%</b></div>
                <span>{item.owner}</span>
              </div>)}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({label,value,note,tone}:{label:string;value:string;note:string;tone:string}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>•</div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

function ImprovementRow({item}:{item:Improvement}) {
  return <div className="improvement-row">
    <b>{item.id}</b>
    <span className={`type-chip ${methodMeta[item.method].className}`}>{item.method}</span>
    <div><strong>{item.title}</strong><small>{item.area}</small></div>
    <span>{item.status}</span>
    <div className="inline-progress"><div className="progress"><i className={methodMeta[item.method].className} style={{width:`${item.progress}%`}} /></div><b>{item.progress}%</b></div>
    <span>{item.owner}</span>
  </div>;
}

function Field({label,value,placeholder,onChange,multiline=false}:{label:string;value:string;placeholder:string;onChange:(value:string)=>void;multiline?:boolean}) {
  return <label className="field"><span>{label}</span>{multiline ? <textarea value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} /> : <input value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} />}</label>;
}

function currency(value:number) {
  return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(value);
}
