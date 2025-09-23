
export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  imagePath: string | null;
  isActive: 'Yes' | 'No';
  isFeatured: boolean;
  defaultPrice: string;
  // يمكنك إضافة باقي الحقول هنا بنفس الطريقة
  // prices: any[]; 
}

export interface ProductsApiResponse {
  data: Product[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

export interface GetProductsParams {
  search?: string;
  page?: number;
  // أضف أي بارامترات أخرى هنا
}
