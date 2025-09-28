"use client";
import { ToggleSwitch } from "flowbite-react";
import { useEffect, useState } from "react";

type Props = {
  initial: boolean;
  onToggle: (next: boolean) => Promise<void> | void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
};

export default function StatusSwitch({
  initial,
  onToggle,
  disabled,
  label,
  size = "md",
}: Props) {
  const [enabled, setEnabled] = useState<boolean>(initial);
  const [loading, setLoading] = useState(false);

  // Sync with external changes (e.g., refetch after optimistic update)
  useEffect(() => {
    setEnabled(initial);
  }, [initial]);

  const handleChange = async (value: boolean) => {
    const prev = enabled;
    setEnabled(value);
    setLoading(true);
    try {
      await onToggle(value);
    } catch (e) {
      setEnabled(prev);
    } finally {
      setLoading(false);
    }
  };

  // نحاول التحكم بالحجم عبر className (Flowbite لا يوفر حجم افتراضي للسويتش في هذا المكون إلا بالـ CSS)
  const sizeClasses = {
    sm: "scale-75 origin-right",
    md: "scale-90 origin-right",
    lg: "scale-100",
  }[size];

  return (
    <div className={sizeClasses} style={{ display: "inline-flex" }}>
      <ToggleSwitch
        checked={enabled}
        onChange={handleChange}
        disabled={disabled || loading}
        label={label}
      />
    </div>
  );
}
