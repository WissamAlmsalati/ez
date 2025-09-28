import { buildListQuery, catalogKeys } from "@/entities/catalog/api";
import type { Unit } from "./types";
import type { ListParams } from "@/entities/catalog/types";
import { mapUnitApi } from "@/entities/catalog/mapper";

export const UNIT_PATH = "/units"; // assuming endpoint

export const unitKeys = {
  ...catalogKeys,
  base: () => catalogKeys.byPath(UNIT_PATH),
  list: (params?: ListParams) => catalogKeys.list(UNIT_PATH, params),
};

export const useUnitsQuery = buildListQuery<Unit>(UNIT_PATH, mapUnitApi);
