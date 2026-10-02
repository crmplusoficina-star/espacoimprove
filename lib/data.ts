export type Method = "Kaizen" | "A3" | "PDCA";
export type ImprovementStatus = "Rascunho" | "Enviado" | "Aprovado" | "Em execução" | "Verificação" | "Concluído";

export type Improvement = {
  id: string;
  method: Method;
  title: string;
  area: string;
  owner: string;
  problem: string;
  objective: string;
  status: ImprovementStatus;
  progress: number;
  public: boolean;
  deadline: string;
  baseline: string;
  target: string;
  impact: number;
  createdAt: string;
};

export const seedImprovements: Improvement[] = [
  {
    id: "KZ-026",
    method: "Kaizen",
    title: "Inspeção 150h em máquinas novas",
    area: "Serviços",
    owner: "Hamilton Matias",
    problem: "As inspeções de 150h não possuem abertura e acompanhamento padronizado após a entrega técnica.",
    objective: "Garantir rastreabilidade e inspeção dentro do prazo.",
    status: "Em execução",
    progress: 72,
    public: true,
    deadline: "30/10/2026",
    baseline: "0%",
    target: "95%",
    impact: 32000,
    createdAt: "2026-10-01"
  },
  {
    id: "A3-014",
    method: "A3",
    title: "Entrega técnica centralizada",
    area: "Serviços",
    owner: "Alisson Mafra",
    problem: "A entrega técnica varia conforme quem executa e nem sempre transmite valor ao cliente.",
    objective: "Entrega diferenciada, operador mais preparado e maior percepção de valor.",
    status: "Em execução",
    progress: 61,
    public: true,
    deadline: "20/11/2026",
    baseline: "Sem padrão",
    target: "100% padrão",
    impact: 68000,
    createdAt: "2026-09-27"
  },
  {
    id: "PD-009",
    method: "PDCA",
    title: "Reduzir retrabalho no faturamento",
    area: "Financeiro",
    owner: "Débora",
    problem: "Pendências de informação provocam reprocessamento e atraso no faturamento.",
    objective: "Reduzir retrabalho e tempo de ciclo.",
    status: "Aprovado",
    progress: 34,
    public: false,
    deadline: "15/12/2026",
    baseline: "18%",
    target: "< 5%",
    impact: 0,
    createdAt: "2026-09-20"
  },
  {
    id: "KZ-021",
    method: "Kaizen",
    title: "Antecipando engate rápido",
    area: "Comercial",
    owner: "Adriano Gomes Batista",
    problem: "O prazo do engate rápido gera espera e risco para a entrega.",
    objective: "Manter disponibilidade antecipada e reduzir espera.",
    status: "Verificação",
    progress: 88,
    public: true,
    deadline: "10/10/2026",
    baseline: "120 dias",
    target: "Reserva disponível",
    impact: 82000,
    createdAt: "2026-08-21"
  }
];

export const methodPrefix: Record<Method, string> = {
  Kaizen: "KZ",
  A3: "A3",
  PDCA: "PD"
};
