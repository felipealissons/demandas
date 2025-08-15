import * as React from "react";

export type Criticidade = "Baixa" | "Média" | "Alta" | "Crítica" | "";

type Props = {
  value: Criticidade;
  onChange: (value: Criticidade) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
};

export default function CriticidadeSelect({
  value,
  onChange,
  disabled,
  label = "Criticidade",
  required,
}: Props) {
  return (
    <label className="block text-sm text-neutral-700">
      <span className="mb-1 block">{label}{required ? " *" : ""}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Criticidade)}
        disabled={disabled}
        className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Selecione a criticidade</option>
        <option value="Baixa">Baixa</option>
        <option value="Média">Média</option>
        <option value="Alta">Alta</option>
        <option value="Crítica">Crítica</option>
      </select>
    </label>
  );
}
