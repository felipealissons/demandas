// src/app/api/admin/invite/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

// Validação simples
const PAPEIS = new Set(["colaborador", "gestor", "admin"]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, nome, papel, gestor_id } = body as { email: string; nome?: string; papel: string; gestor_id?: string | null };

    if (!email || !PAPEIS.has(papel)) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
    }

    // 1) Envia convite por e-mail (magic link)
    const { data: invite, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { name: nome ?? "" },
    });
    if (inviteErr) {
      return NextResponse.json({ error: inviteErr.message }, { status: 400 });
    }

    const uid = invite.user?.id;
    if (!uid) {
      return NextResponse.json({ error: "Não foi possível obter o ID do usuário convidado." }, { status: 500 });
    }

    // 2) Garante/ajusta PERFIL com papel e gestor
    // Service Role ignora RLS e permite upsert tranquilo.
    const { error: upsertErr } = await supabaseAdmin
      .from("perfis")
      .upsert({ id: uid, nome: nome ?? email, papel, gestor_id: gestor_id ?? null }, { onConflict: "id" });

    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, user_id: uid });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Erro inesperado." }, { status: 500 });
  }
}
