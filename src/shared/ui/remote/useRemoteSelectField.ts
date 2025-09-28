import { useState, useCallback } from "react";
import { UseFormSetValue } from "react-hook-form";

/**
 * Generic helper hook for binding a RemoteSelect to react-hook-form field (storing primitive id) while keeping full object locally.
 * @param formField the name of the field in RHF storing the primitive id (e.g., 'type_id')
 * @param setValue RHF setValue
 */
export function useRemoteSelectField<TOption extends { id: number | string }>(
  formField: string,
  setValue: UseFormSetValue<any>
) {
  const [option, setOption] = useState<TOption | null>(null);

  const onChange = useCallback(
    (val: TOption | null) => {
      setOption(val);
      setValue(formField as any, val ? (val as any).id : undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [formField, setValue]
  );

  const reset = useCallback(() => setOption(null), []);

  return { option, onChange, reset };
}
