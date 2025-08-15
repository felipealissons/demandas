"use client";
import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import DemandaCard from "../../components/demandas/DemandaCard";
import { calcularPrioridade } from "../../lib/prioridade";
import { getDemandas, type Demanda } from "../../services/demandas";

export default function DemandasPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["demandas-supa"],
    queryFn: () => getDemandas(),
  });

  const ordenadas = React.useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const sa = calcularPrioridade({
        impacto: a.impacto, esforco: a.esforco, criticidade: a.criticidade,
        prazo: a.prazo ? new Date(a.prazo) : undefined, status: a.status
      }).score;
      const sb = calcularPrioridade({
        impacto: b.impacto, esforco: b.esforco, criticidade: b.criticidade,
        prazo: b.prazo ? new Date(b.prazo) : undefined, status: b.status
      }).score;
      return sb - sa;
    });
  }, [data]);

  if (isLoading) return <main className="p-6">Carregando…</main>;
  if (isError)   return <main className="p-6">Erro ao carregar. <button onClick={()=>refetch()}>Tentar de novo</button></main>;

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Demandas</h1>
          <Link href="/demandas/nova" className="px-3 py-2 rounded bg-indigo-600 text-white text-sm">
            Nova demanda
          </Link>
        </div>

        {ordenadas.map((d) => (
          <div key={d.id} className="space-y-2">
            <div className="text-sm">
              <Link href={`/demandas/${d.id}`} className="text-indigo-600 hover:underline">
                Abrir detalhe (ID: {d.id})
              </Link>
            </div>

            <DemandaCard
              id={d.id}
              titulo={d.titulo}
              descricao={d.descricao}
              prazo={d.prazo ? new Date(d.prazo) : undefined}
              status={d.status}
              defaultImpacto={d.impacto}
              defaultEsforco={d.esforco}
              defaultCriticidade={d.criticidade}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
