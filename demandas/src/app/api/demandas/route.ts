import { NextResponse } from "next/server";
import { db, type Demanda } from "../../../server/mockDb";

export async function GET() {
  return NextResponse.json(db.demandas);
}

export async function POST(req: Request) {
  const body = await req.json();
  const agora = new Date().toISOString();

  // validações simples
  if (!body?.titulo || typeof body.titulo !== "string") {
    return NextResponse.json({ erro: "Título é obrigatório." }, { status: 400 });
  }

  const nova: Demanda = {
    id: crypto.randomUUID(),
    titulo: body.titulo,
    descricao: body.descricao ?? "",
    impacto: body.impacto ?? "Médio",
    esforco: body.esforco ?? "Médio",
    criticidade: body.criticidade ?? "Média",
    status: body.status ?? "aberta",
    prazo: body.prazo ?? undefined,
    criadoEm: agora,
    atualizadoEm: agora,
  };

  db.demandas.unshift(nova);
  return NextResponse.json(nova, { status: 201 });
}
