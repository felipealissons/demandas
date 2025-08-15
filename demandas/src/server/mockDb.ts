// src/server/mockDb.ts
export type Impacto = "Baixo" | "Médio" | "Alto";
export type Esforco = "Baixo" | "Médio" | "Alto";
export type Criticidade = "Baixa" | "Média" | "Alta" | "Crítica";
export type Status = "aberta" | "em_progresso" | "bloqueada" | "concluida" | "cancelada";

export type Demanda = {
  id: string;
  titulo: string;
  descricao?: string;
  impacto: Impacto;
  esforco: Esforco;
  criticidade: Criticidade;
  status: Status;
  prazo?: string;       // ISO
  criadoEm: string;     // ISO
  atualizadoEm: string; // ISO
};

// @ts-ignore – criamos um campo global para sobreviver a HMR (dev)
const g: any = globalThis as any;

// Se já existir, reaproveita; senão cria uma nova estrutura
if (!g.__DEMANDAS_DB__) {
  g.__DEMANDAS_DB__ = { demandas: [] as Demanda[] };

  // seed inicial só UMA vez
  const agora = new Date();
  const d1 = new Date(agora.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
  const d2 = new Date(agora.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();

  g.__DEMANDAS_DB__.demandas.push(
    {
      id: crypto.randomUUID(),
      titulo: "Ajuste no site do cliente",
      descricao: "Corrigir formulário de contato (erro 500).",
      impacto: "Alto",
      esforco: "Baixo",
      criticidade: "Alta",
      status: "em_progresso",
      prazo: d1,
      criadoEm: agora.toISOString(),
      atualizadoEm: agora.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Relatório mensal de vendas",
      descricao: "Consolidar indicadores e gráficos.",
      impacto: "Médio",
      esforco: "Médio",
      criticidade: "Média",
      status: "aberta",
      prazo: d2,
      criadoEm: agora.toISOString(),
      atualizadoEm: agora.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      titulo: "Migração de servidor",
      descricao: "Mover aplicação para nova infra.",
      impacto: "Alto",
      esforco: "Alto",
      criticidade: "Crítica",
      status: "bloqueada",
      criadoEm: agora.toISOString(),
      atualizadoEm: agora.toISOString(),
    }
  );
}

// Exporta sempre a mesma instância
export const db: { demandas: Demanda[] } = g.__DEMANDAS_DB__;
