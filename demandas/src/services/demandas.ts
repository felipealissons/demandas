"use client";
import { supabase } from "../lib/supabaseClient";

export type Impacto = "Baixo" | "Médio" | "Alto";
export type Esforco = "Baixo" | "Médio" | "Alto";
export type Criticidade = "Baixa" | "Média" | "Alta" | "Crítica";
export type Status = "aberta" | "em_progresso" | "bloqueada" | "concluida" | "cancelada";

export type Demanda = {
  id: string;
  titulo: string;
  descricao?: string | null;
  impacto: Impacto;
  esforco: Esforco;
  criticidade: Criticidade;
  status: Status;
  prazo?: string | null;        // ISO
  criado_em: string;
  atualizado_em: string;
  criador_id: string;
  responsavel_id: string;
};

export async function getDemandas(): Promise<Demanda[]> {
  const { data, error } = await supabase
    .from("demandas")
    .select("*")
    .order("atualizado_em", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Demanda[];
}

export async function getDemandaById(id: string): Promise<Demanda | null> {
  const { data, error } = await supabase
    .from("demandas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Demanda;
}

export async function patchDemanda(
  id: string,
  patch: Partial<Pick<Demanda, "impacto" | "esforco" | "criticidade" | "status">>
): Promise<Demanda> {
  const { data, error } = await supabase
    .from("demandas")
    .update({ ...patch, atualizado_em: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as Demanda;
}

/** PERFIS (para o select de responsável) */
export type Perfil = {
    id: string;
    nome: string;
    papel: "colaborador" | "gestor" | "admin";
    gestor_id: string | null;
    ativo: boolean; // <— novo
  };
  
  export async function getPerfis(): Promise<Perfil[]> {
    const { data, error } = await supabase
      .from("perfis")
      .select("id, nome, papel, gestor_id, ativo") // <— inclua ativo
      .order("papel", { ascending: true })
      .order("nome", { ascending: true });
  
    if (error) throw error;
    return (data ?? []) as Perfil[];
  }

/** CREATE (DEV: criador_id e responsavel_id vêm do formulário) */
export async function createDemanda(payload: {
  titulo: string;
  descricao?: string;
  impacto: Impacto;
  esforco: Esforco;
  criticidade: Criticidade;
  status: Status;
  prazo?: string | null;        // ISO (ex.: '2025-08-30T00:00:00.000Z')
  criador_id: string;
  responsavel_id: string;
}): Promise<Demanda> {
  const { data, error } = await supabase
    .from("demandas")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as Demanda;
}

// src/services/demandas.ts
export type Comentario = {
  id: string;
  demanda_id: string;
  autor_id: string;
  conteudo: string;
  criado_em: string;
};

export async function getComentarios(demandaId: string): Promise<Comentario[]> {
  const { data, error } = await supabase
    .from("comentarios")
    .select("id, demanda_id, autor_id, conteudo, criado_em")
    .eq("demanda_id", demandaId)
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addComentario(demandaId: string, conteudo: string) {
  const { error } = await supabase
    .from("comentarios")
    .insert({ demanda_id: demandaId, conteudo });
  if (error) throw error;
}