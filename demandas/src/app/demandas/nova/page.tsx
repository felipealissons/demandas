"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createDemanda, getPerfis, type Impacto, type Esforco, type Criticidade, type Status } from "../../../services/demandas";

export default function NovaDemandaPage() {
  const router = useRouter();

  // carregar perfis para selects
  const { data: perfis } = useQuery({
    queryKey: ["perfis-dev"],
    queryFn: () => getPerfis(),
  });

  // estado do form
  const [titulo, setTitulo] = React.useState("");
  const [descricao, setDescricao] = React.useState("");
  const [impacto, setImpacto] = React.useState<Impacto>("Médio");
  const [esforco, setEsforco] = React.useState<Esforco>("Médio");
  const [criticidade, setCriticidade] = React.useState<Criticidade>("Média");
  const [status, setStatus] = React.useState<Status>("aberta");
  const [prazo, setPrazo] = React.useState<string>(""); // yyyy-mm-dd
  const [criadorId, setCriadorId] = React.useState<string>("");
  const [responsavelId, setResponsavelId] = React.useState<string>("");

  React.useEffect(() => {
    if (perfis?.length) {
      // defaults
      setCriadorId(perfis[0].id);
      setResponsavelId(perfis[0].id);
    }
  }, [perfis]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createDemanda({
        titulo,
        descricao,
        impacto,
        esforco,
        criticidade,
        status,
        prazo: prazo ? new Date(prazo).toISOString() : null,
        criador_id: criadorId,
        responsavel_id: responsavelId,
      }),
    onSuccess: (d) => {
      router.push(`/demandas/${d.id}`);
    },
    onError: (err: any) => {
      alert(`Erro ao criar: ${err.message ?? "verifique RLS"}`);
    },
  });

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Nova demanda</h1>

        <div className="rounded-xl border bg-white p-4 space-y-4">
          <div className="grid gap-3">
            <label className="text-sm font-medium">Título</label>
            <input className="rounded border p-2" value={titulo} onChange={(e)=>setTitulo(e.target.value)} placeholder="Ex.: Ajuste no site do cliente" />
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-medium">Descrição</label>
            <textarea className="rounded border p-2" rows={4} value={descricao} onChange={(e)=>setDescricao(e.target.value)} placeholder="Detalhe o que precisa ser feito..." />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Impacto</label>
              <select className="rounded border p-2" value={impacto} onChange={(e)=>setImpacto(e.target.value as Impacto)}>
                <option>Baixo</option><option>Médio</option><option>Alto</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Esforço</label>
              <select className="rounded border p-2" value={esforco} onChange={(e)=>setEsforco(e.target.value as Esforco)}>
                <option>Baixo</option><option>Médio</option><option>Alto</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Criticidade</label>
              <select className="rounded border p-2" value={criticidade} onChange={(e)=>setCriticidade(e.target.value as Criticidade)}>
                <option>Baixa</option><option>Média</option><option>Alta</option><option>Crítica</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Status</label>
              <select className="rounded border p-2" value={status} onChange={(e)=>setStatus(e.target.value as Status)}>
                <option value="aberta">Aberta</option>
                <option value="em_progresso">Em progresso</option>
                <option value="bloqueada">Bloqueada</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Prazo</label>
              <input type="date" className="rounded border p-2" value={prazo} onChange={(e)=>setPrazo(e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Criador (DEV)</label>
              <select className="rounded border p-2" value={criadorId} onChange={(e)=>setCriadorId(e.target.value)}>
                {perfis?.map(p => <option key={p.id} value={p.id}>{p.nome} — {p.papel}</option>)}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Responsável</label>
              <select className="rounded border p-2" value={responsavelId} onChange={(e)=>setResponsavelId(e.target.value)}>
                {perfis?.map(p => <option key={p.id} value={p.id}>{p.nome} — {p.papel}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => mutate()}
              disabled={isPending || !titulo || !criadorId || !responsavelId}
              className="rounded bg-indigo-600 text-white px-4 py-2 disabled:opacity-50"
            >
              {isPending ? "Criando..." : "Criar demanda"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
