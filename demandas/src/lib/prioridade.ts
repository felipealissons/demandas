// Tipos em PT-BR
export type Impacto = "Baixo" | "Médio" | "Alto";
export type Esforco = "Baixo" | "Médio" | "Alto";
export type Criticidade = "Baixa" | "Média" | "Alta" | "Crítica";
export type Status = "aberta" | "em_progresso" | "bloqueada" | "concluida" | "cancelada";

export type Celula = "A1" | "A2" | "A3" | "M1" | "M2" | "M3" | "I1" | "I2" | "I3";

export type ResultadoPrioridade = {
  score: number;
  rotulo: "Prioridade Máxima" | "Alta" | "Média" | "Baixa";
  celula: Celula;
  detalhes: {
    pesoBase: number;
    bonusCriticidade: number;
    bonusPrazo: number;
    penalidadeBloqueio: number;
    ajusteEspecial: number;
  };
};

// 1) Peso base da matriz (pode ir para config depois)
const PESO_BASE: Record<Celula, number> = {
  A1: 100, A2: 90,  A3: 80,
  M1: 70,  M2: 60,  M3: 50,
  I1: 40,  I2: 30,  I3: 20,
};

const BONUS_CRITICIDADE: Record<Criticidade, number> = {
  "Crítica": 15,
  "Alta": 8,
  "Média": 3,
  "Baixa": 0,
};

function calcularBonusPrazo(prazo?: Date, agora = new Date()): number {
  if (!prazo) return 0;
  // zera horas para comparação "por dia"
  const p = new Date(prazo.getFullYear(), prazo.getMonth(), prazo.getDate());
  const a = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const diffMs = p.getTime() - a.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDias < 0) return 20;       // atrasada
  if (diffDias <= 2) return 10;      // vence em ≤ 48h
  if (diffDias <= 5) return 5;       // vence em ≤ 5 dias
  return 0;
}

// 2) Determina a célula da matriz a partir de Impacto × Esforço
export function obterCelula(impacto: Impacto, esforco: Esforco): Celula {
  const i = impacto;
  const e = esforco;
  if (i === "Alto" && e === "Baixo") return "A1";
  if (i === "Alto" && e === "Médio") return "A2";
  if (i === "Alto" && e === "Alto") return "A3";
  if (i === "Médio" && e === "Baixo") return "M1";
  if (i === "Médio" && e === "Médio") return "M2";
  if (i === "Médio" && e === "Alto") return "M3";
  if (i === "Baixo" && e === "Baixo") return "I1";
  if (i === "Baixo" && e === "Médio") return "I2";
  return "I3"; // Baixo x Alto
}

// 3) Calcula score, rótulo e detalhamento
export function calcularPrioridade(args: {
  impacto: Impacto;
  esforco: Esforco;
  criticidade: Criticidade;
  prazo?: Date;
  status?: Status;
}): ResultadoPrioridade {
  const celula = obterCelula(args.impacto, args.esforco);
  const pesoBase = PESO_BASE[celula];

  // Bônus e penalidades
  const bonusCriticidade = BONUS_CRITICIDADE[args.criticidade];
  const bonusPrazo = calcularBonusPrazo(args.prazo);
  const penalidadeBloqueio = args.status === "bloqueada" ? 10 : 0;

  // Regra especial: Impacto Alto + Crítica promove 1 "passo" se não estiver A1
  let ajusteEspecial = 0;
  if (args.impacto === "Alto" && args.criticidade === "Crítica") {
    if (celula === "A2") ajusteEspecial = 10; // aproxima de A1
    else if (celula === "A3") ajusteEspecial = 5;
  }

  const score = Math.max(
    0,
    Math.round(pesoBase + bonusCriticidade + bonusPrazo - penalidadeBloqueio + ajusteEspecial)
  );

  // Rótulos por score (pode ser parametrizado depois)
  let rotulo: ResultadoPrioridade["rotulo"] = "Baixa";
  if (score >= 95) rotulo = "Prioridade Máxima";
  else if (score >= 80) rotulo = "Alta";
  else if (score >= 60) rotulo = "Média";

  return {
    score,
    rotulo,
    celula,
    detalhes: { pesoBase, bonusCriticidade, bonusPrazo, penalidadeBloqueio, ajusteEspecial },
  };
}
