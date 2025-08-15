import * as React from "react";
import type { Impacto } from "@/components/inputs/ImpactoSelect";

const cores: Record<Exclude<Impacto, "">, string> = {
  Baixo: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  "Médio": "bg-amber-100 text-amber-800 ring-amber-200",
  Alto: "bg-rose-100 text-rose-800 ring-rose-200",
};

type Props = {
  impacto: Impacto;
  className?: string;
};

export default function ImpactBadge({ impacto, className = "" }: Props) {
  if (!impacto) return null;
  const cls = cores[impacto as Exclude<Impacto, "">] ?? "bg-gray-100 text-gray-800 ring-gray-200";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ring-1 ${cls} ${className}`}
    >
      Impacto: {impacto}
    </span>
  );
}
