"use client";
import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// IMPORTS RELATIVOS (evita alias quebrar)
import ImpactBadge from "../../components/display/ImpactBadge";
import PrioridadePill from "../../components/display/PrioridadePill";
import ImpactoSelect, { type Impacto } from "../../components/inputs/ImpactoSelect";
import EsforcoSelect, { type Esforco } from "../../components/inputs/EsforcoSelect";
import CriticidadeSelect, { type Criticidade } from "../../components/inputs/CriticidadeSelect";
import { calcularPrioridade, type Status } from "../../lib/prioridade";
import { patchDemanda } from "../../services/demandas";

type Props = {
  id: string;
  titulo: string;
  descricao?: string | null;
  prazo?: Date;
  status?: Status;
  defaultImpacto?: Impacto;
  defaultEsforco?: Esforco;
  defaultCriticidade?: Criticidade;
};

export default function DemandaCard({
  id,
  titulo,
  descricao,
  prazo,
  status = "aberta",
  defaultImpacto = "Médio",
  defaultEsforco = "Médio",
  defaultCriticidade = "Média",
}: Props) {
  const qc = useQueryClient();

  const [impacto, setImpacto] = React.useState<Impacto>(defaultImpacto);
  const [esforco, setEsforco] = React.useState<Esforco>(defaultEsforco);
  const [criticidade, setCriticidade] = React.useState<Criticidade>(defaultCriticidade);

  const prioridade = calcularPrioridade({
    impacto: impacto as any,
    esforco: esforco as any,
    criticidade: criticidade as any,
    prazo,
    status,
  });

  // Mutation para salvar no Supabase (com update otimista)
  const { mutate, isPending } = useMutation({
    mutationFn: (patch: Partial<{ impacto: Impacto; esforco: Esforco; criticidade: Criticidade; status: Status }>) =>
      patchDemanda(id, patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: ["demandas-supa"] });
      await qc.cancelQueries({ queryKey: ["demanda-supa", id] });

      const prevLista = qc.getQueryData<any[]>(["demandas-supa"]);
      const prevItem  = qc.getQueryData<any>(["demanda-supa", id]);

      const applyPatch = (d: any) => (d?.id === id ? { ...d, ...patch, atualizado_em: new Date().toISOString() } : d);

      if (prevLista) qc.setQueryData(["demandas-supa"], prevLista.map(applyPatch));
      if (prevItem)  qc.setQueryData(["demanda-supa", id], { ...prevItem, ...patch, atualizado_em: new Date().toISOString() });

      return { prevLista, prevItem };
    },
    onError: (_err, _patch, ctx) => {
      if (ctx?.prevLista) qc.setQueryData(["demandas-supa"], ctx.prevLista);
      if (ctx?.prevItem)  qc.setQueryData(["demanda-supa", id], ctx.prevItem);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["demandas-supa"] });
      qc.invalidateQueries({ queryKey: ["demanda-supa", id] });
    },
  });

  // Handlers → atualizam estado local e disparam PATCH
  const handleImpacto = (v: Impacto) => { setImpacto(v); mutate({ impacto: v }); };
  const handleEsforco = (v: Esforco) => { setEsforco(v); mutate({ esforco: v }); };
  const handleCriticidade = (v: Criticidade) => { setCriticidade(v); mutate({ criticidade: v }); };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{titulo}</h3>
          {descricao && <p className="text-sm text-neutral-600">{descricao}</p>}
        </div>
        <div className="flex items-center gap-3">
          {isPending && <span className="text-xs text-neutral-500">Salvando…</span>}
          <PrioridadePill rotulo={prioridade.rotulo} score={prioridade.score} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ImpactBadge impacto={impacto || "Médio"} />
        {prazo && (
          <span className="text-xs text-neutral-600">
            Prazo: {prazo.toLocaleDateString("pt-BR")}
          </span>
        )}
        <span className="text-xs text-neutral-500">Status: {status.replace("_", " ")}</span>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ImpactoSelect value={impacto} onChange={handleImpacto} />
        <EsforcoSelect value={esforco} onChange={handleEsforco} />
        <CriticidadeSelect value={criticidade} onChange={handleCriticidade} />
      </div>

      <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-700">
        <div>
          Célula: <strong>{prioridade.celula}</strong>
        </div>
        <div className="opacity-80">
          Detalhes: base {prioridade.detalhes.pesoBase} + crit {prioridade.detalhes.bonusCriticidade} + prazo {prioridade.detalhes.bonusPrazo} - bloqueio {prioridade.detalhes.penalidadeBloqueio} + ajuste {prioridade.detalhes.ajusteEspecial}
        </div>
      </div>
    </div>
  );
}
