"use client";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabaseClient";
import { getPerfis, type Perfil } from "../../../services/demandas";

const PAPEIS: Perfil["papel"][] = ["colaborador", "gestor", "admin"];

type EditState = {
  id: string;
  nome: string;
  papel: Perfil["papel"];
  gestor_id: string | null;
  ativo: boolean;
};

export default function ColaboradoresAdminPage() {
  const qc = useQueryClient();

  // Checa se usuário logado é admin (simple client-side guard)
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) { setIsAdmin(false); return; }
      const { data: perfil, error } = await supabase
        .from("perfis")
        .select("papel")
        .eq("id", uid)
        .maybeSingle();
      if (error) { setIsAdmin(false); return; }
      setIsAdmin(perfil?.papel === "admin");
    })();
  }, []);

  // Lista de perfis
  const { data: perfis, isLoading, refetch } = useQuery({
    queryKey: ["perfis-admin"],
    queryFn: () => getPerfis(),
  });

  // UPDATE (não enviar id no payload)
  const { mutate: updatePerfil } = useMutation({
    mutationFn: async (p: { id: string; nome?: string; papel?: Perfil["papel"]; gestor_id?: string | null; ativo?: boolean }) => {
      const { id, ...fields } = p; // <-- evita enviar PK no update
      const { error } = await supabase.from("perfis").update(fields).eq("id", id);
      if (error) throw error;
    },
    onError: (e: any) => {
      console.error("UPDATE perfis falhou:", e);
      alert(e?.message ?? "Erro ao salvar.");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["perfis-admin"] }),
  });

  // DELETE (via rota server-side com Service Role)
  const { mutate: deleteUser, isPending: deleting } = useMutation({
    mutationFn: async (userId: string) => {
      const r = await fetch(`/api/admin/users/${userId}/delete`, { method: "POST" });
      let payload: any = null;
      try { payload = await r.json(); } catch { /* ignore */ }
      if (!r.ok) {
        const msg = payload?.error || `Falha ao excluir (HTTP ${r.status})`;
        throw new Error(msg);
      }
      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["perfis-admin"] });
      alert("Usuário excluído.");
    },
    onError: (e: any) => {
      console.error("DELETE user falhou:", e);
      alert(e?.message ?? "Erro ao excluir.");
    },
  });

  // Modal de edição
  const [editing, setEditing] = React.useState<EditState | null>(null);
  const openEdit = (p: Perfil) =>
    setEditing({ id: p.id, nome: p.nome ?? "", papel: p.papel, gestor_id: p.gestor_id, ativo: p.ativo });
  const closeEdit = () => setEditing(null);
  const saveEdit = () => {
    if (!editing) return;
    updatePerfil({
      id: editing.id,
      nome: editing.nome,
      papel: editing.papel,
      gestor_id: editing.gestor_id,
      ativo: editing.ativo,
    });
    closeEdit();
  };

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="max-w-5xl mx-auto p-6">
          <h1 className="text-2xl font-semibold mb-4">Colaboradores</h1>
          <p className="text-sm text-red-600">Acesso negado. Esta página é apenas para administradores.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Colaboradores</h1>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); alert("Use o botão de convite que você adicionou anteriormente (ou adicione de novo aqui)."); }}
            className="px-3 py-2 rounded bg-indigo-600 text-white text-sm"
          >
            Convidar colaborador
          </a>
        </div>

        {/* Tabela */}
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 text-left">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Papel</th>
                <th className="p-3">Gestor</th>
                <th className="p-3">Ativo</th>
                <th className="p-3 w-56">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td className="p-3" colSpan={5}>Carregando…</td></tr>
              ) : (perfis ?? []).map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.nome}</td>
                  <td className="p-3 capitalize">{p.papel}</td>
                  <td className="p-3">{perfis?.find((g) => g.id === p.gestor_id)?.nome ?? "—"}</td>
                  <td className="p-3">{p.ativo ? "Sim" : "Não"}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => openEdit(p)} className="px-2 py-1 rounded border">Editar</button>
                    <button
                      onClick={() => {
                        if (confirm("Excluir definitivamente este usuário? (Remove do Auth e do banco)")) {
                          deleteUser(p.id);
                        }
                      }}
                      disabled={deleting}
                      className="px-2 py-1 rounded border text-red-600 disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {(perfis?.length ?? 0) === 0 && !isLoading && (
                <tr><td className="p-3 text-neutral-500" colSpan={5}>Nenhum colaborador encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edição */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-4 space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold">Editar colaborador</h2>

            <div className="grid gap-3">
              <label className="text-sm font-medium">Nome</label>
              <input
                className="rounded border p-2"
                value={editing.nome}
                onChange={(e) => setEditing((s) => (s ? { ...s, nome: e.target.value } : s))}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Papel</label>
                <select
                  className="rounded border p-2 capitalize"
                  value={editing.papel}
                  onChange={(e) =>
                    setEditing((s) => (s ? { ...s, papel: e.target.value as Perfil["papel"] } : s))
                  }
                >
                  {PAPEIS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Gestor</label>
                <select
                  className="rounded border p-2"
                  value={editing.gestor_id ?? ""}
                  onChange={(e) => setEditing((s) => (s ? { ...s, gestor_id: e.target.value || null } : s))}
                >
                  <option value="">— sem gestor —</option>
                  {perfis?.filter((g) => g.papel === "gestor").map((g) => (
                    <option key={g.id} value={g.id}>{g.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.ativo}
                onChange={(e) => setEditing((s) => (s ? { ...s, ativo: e.target.checked } : s))}
              />
              Usuário ativo
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={closeEdit} className="px-3 py-2 rounded border text-sm">Cancelar</button>
              <button onClick={saveEdit} className="px-3 py-2 rounded bg-indigo-600 text-white text-sm">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
