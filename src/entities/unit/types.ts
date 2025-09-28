import type { BaseItem } from "@/entities/catalog/types";

export interface Unit extends BaseItem {
  symbol?: string | null;
  displayName?: string | null;
}
