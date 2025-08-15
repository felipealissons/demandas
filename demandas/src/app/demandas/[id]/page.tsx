"use client";
import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DemandaCard from "../../../components/demandas/DemandaCard";
import { getDemandaById, type Demanda } from "../../../services/demandas";

export default function DetalheDemandaPage() {
  const raw = useParams<{ id: string }>().id;
  const id = decodeURIComponent(Array.isArray(raw) ? raw[0] : raw).replace(/^"+|"+$/g, "");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["demanda-supa", id],
    queryFn: () => getDemandaById(id),
  });

  if (isLoading) return <main className="p-6">Carregando…</main>;
  if (isError || !data) return <main className="p-6">Demanda não encontrada.</main>;

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Demanda: {data.titulo}</h1>
        <DemandaCard
          id={data.id}
          titulo={data.titulo}
          descricao={data.descricao}
          prazo={data.prazo ? new Date(data.prazo) : undefined}
          status={data.status}
          defaultImpacto={data.impacto}
          defaultEsforco={data.esforco}
          defaultCriticidade={data.criticidade}
        />
      </div>
    </main>
  );
}
