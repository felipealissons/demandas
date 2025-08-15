import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // 1) Tenta remover do Auth (pode falhar com "User not found" em seeds)
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (delErr && !/user not found/i.test(delErr.message)) {
      // Se for erro diferente de "User not found", aí sim trate como falha
      console.error("Admin deleteUser error:", delErr);
      return NextResponse.json({ error: delErr.message }, { status: 400 });
    }

    // 2) Remove o perfil do banco mesmo que o usuário não exista no Auth
    const { error: dbErr } = await supabaseAdmin.from("perfis").delete().eq("id", userId);
    if (dbErr) {
      console.error("DB delete perfis error:", dbErr);
      // Já removemos do Auth (ou nem existia). Considero sucesso mesmo assim.
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("API delete user fatal:", e);
    return NextResponse.json({ error: e?.message ?? "Erro inesperado" }, { status: 500 });
  }
}
