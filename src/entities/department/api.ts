import {
  buildCreateMutation,
  buildListQuery,
  buildToggleMutation,
  catalogKeys,
} from "@/entities/catalog/api";
import type { Department } from "./types";
import type { ListParams } from "@/entities/catalog/types";
import { mapDepartmentApi } from "@/entities/catalog/mapper";

export const DEPARTMENT_PATH = "/departments";

export const departmentKeys = {
  ...catalogKeys,
  base: () => catalogKeys.byPath(DEPARTMENT_PATH),
  list: (params?: ListParams) => catalogKeys.list(DEPARTMENT_PATH, params),
};

export const useDepartmentsQuery = buildListQuery<Department>(
  DEPARTMENT_PATH,
  mapDepartmentApi
);
export const useCreateDepartment = buildCreateMutation<any, Department>(
  DEPARTMENT_PATH
);
export const useToggleDepartment =
  buildToggleMutation<Department>(DEPARTMENT_PATH);
