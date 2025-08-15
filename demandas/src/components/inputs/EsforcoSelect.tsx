import * as React from "react";

export type Esforco = "Baixo" | "Médio" | "Alto" | "";

type Props = {
  value: Esforco;
  onChange: (value: Esforco) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
};

export default function EsforcoSelect({
  value,
  onChange,
  disabled,
  label = "Esforço",
  required,
}: Props) {
  return (
    <label className="block text-sm text-neutral-700">
      <span className="mb-1 block">{label}{required ? " *" : ""}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Esforco)}
        disabled={disabled}
        className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Selecione o esforço</option>
        <option value="Baixo">Baixo</option>
        <option value="Médio">Médio</option>
        <option value="Alto">Alto</option>
      </select>
    </label>
  );
}
