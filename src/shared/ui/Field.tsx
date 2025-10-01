import { Label, TextInput } from 'flowbite-react';
import React from 'react'

export default function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <Label className="text-gray-500 dark:text-gray-400">{label}</Label>
      <TextInput
        className="bg-white dark:bg-gray-800"
        readOnly
        value={value ? String(value) : "-"}
      />
    </div>
  );
}
