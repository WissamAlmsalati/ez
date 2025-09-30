// هوك بسيط يعيد تغليف useProductsQueryV2 مع بارامتر is_featured=true
import { useProductsQueryV2 } from "@/entities/product/api";
import type { ProductListParams } from "@/entities/product/api";

export function useFeaturedProductsQuery(
  params: Omit<ProductListParams, "is_featured"> = {}
) {
  return useProductsQueryV2({ ...params, is_featured: true });
}
