import * as React from "react";

export type Impacto = "Baixo" | "Médio" | "Alto" | "";

type Props = {
  value: Impacto;
  onChange: (value: Impacto) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
};

export default function ImpactoSelect({
  value,
  onChange,
  disabled,
  label = "Impacto",
  required,
}: Props) {
  return (
    <label className="block text-sm text-neutral-700">
      <span className="mb-1 block">{label}{required ? " *" : ""}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Impacto)}
        disabled={disabled}
        className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Selecione o impacto</option>
        <option value="Baixo">Baixo</option>
        <option value="Médio">Médio</option>
        <option value="Alto">Alto</option>
      </select>
    </label>
  );
}
