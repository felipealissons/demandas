// services/demandasService.js
import { supabase } from "@/lib/supabaseClient";

export async function getDemandas() {
  const { data, error } = await supabase
    .from("demandas") // nome da tabela no Supabase
    .select("*");

  if (error) {
    console.error("Erro ao buscar demandas:", error);
    return [];
  }

  return data || [];
}
