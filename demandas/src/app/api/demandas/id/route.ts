import { NextResponse } from "next/server";
import { db } from "../../../../server/mockDb";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const item = db.demandas.find(d => d.id === params.id);
  if (!item) return NextResponse.json({ erro: "Não encontrada" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const i = db.demandas.findIndex(d => d.id === params.id);
  if (i === -1) return NextResponse.json({ erro: "Não encontrada" }, { status: 404 });

  const atual = db.demandas[i];
  const atualizado = {
    ...atual,
    ...body,
    atualizadoEm: new Date().toISOString(),
  };
  db.demandas[i] = atualizado;
  return NextResponse.json(atualizado);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const i = db.demandas.findIndex(d => d.id === params.id);
  if (i === -1) return NextResponse.json({ erro: "Não encontrada" }, { status: 404 });
  const [removida] = db.demandas.splice(i, 1);
  return NextResponse.json(removida);
}
