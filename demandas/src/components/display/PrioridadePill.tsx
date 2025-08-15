import * as React from "react";

type Rotulo = "Prioridade Máxima" | "Alta" | "Média" | "Baixa";

const cores: Record<Rotulo, string> = {
  "Prioridade Máxima": "bg-indigo-600 text-white",
  "Alta": "bg-rose-600 text-white",
  "Média": "bg-amber-500 text-black",
  "Baixa": "bg-neutral-200 text-neutral-900",
};

export default function PrioridadePill({
  rotulo,
  score,
  className = "",
}: {
  rotulo: Rotulo;
  score: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${cores[rotulo]} ${className}`}>
      {rotulo} <span className="opacity-80">•</span> {score}
    </span>
  );
}
