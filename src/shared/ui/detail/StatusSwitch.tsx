"use client";
import { ToggleSwitch } from "flowbite-react";
import React from "react";

interface StatusSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}

export function StatusSwitch({
  checked,
  onChange,
  label = "الحالة",
}: StatusSwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <ToggleSwitch checked={checked} label={label} onChange={onChange} />
    </div>
  );
}
