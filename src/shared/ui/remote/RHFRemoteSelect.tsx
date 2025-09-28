"use client";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import RemoteSelect, { RemoteSelectProps } from "./RemoteSelect";

/**
 * Wrapper integrates RemoteSelect with React Hook Form.
 * Stores only the id (primitive) in the form state while RemoteSelect keeps the full object in its own local state.
 */
export interface RHFRemoteSelectProps<TItem, TForm extends FieldValues>
  extends Omit<RemoteSelectProps<TItem>, "value" | "onChange"> {
  name: Path<TForm>;
  control: Control<TForm>;
  /** When true, store whole object instead of id */
  storeObject?: boolean;
  /** Extract id from item (default: getOptionValue) */
  getItemId?: (item: TItem) => string | number;
}

export function RHFRemoteSelect<TItem, TForm extends FieldValues>(
  props: RHFRemoteSelectProps<TItem, TForm>
) {
  const {
    name,
    control,
    storeObject = false,
    getItemId,
    getOptionValue,
    getOptionLabel,
    ...rest
  } = props as any;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const { value, onChange } = field;
        // We keep internal selected object in local state inside RemoteSelect by reconstructing it from cached pages when possible.
        // For simplicity we pass null as controlled value; improvement: accept an optional 'resolveItem' prop to fetch a single entity.
        return (
          <RemoteSelect
            {...rest}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            value={null}
            onChange={(item) => {
              if (!item) {
                onChange(undefined);
              } else {
                if (storeObject) onChange(item);
                else
                  onChange(getItemId ? getItemId(item) : getOptionValue(item));
              }
            }}
          />
        );
      }}
    />
  );
}

export default RHFRemoteSelect;
