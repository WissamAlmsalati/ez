export type OrderStatus =
  | "new"
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | string;

export interface DailyProfitStat {
  amount: number;
  change: string; // e.g. "+0.00%"
}

export interface ProductsStat {
  total: number;
  active: number;
  inactive: number;
}

export interface OrdersStat {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface HomeStats {
  dailyProfit: DailyProfitStat;
  products: ProductsStat;
  orders: OrdersStat;
}

export interface LatestOrder {
  id: number;
  orderNumber: string | null;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string; // ISO date string (yyyy-mm-dd)
  deliveryDate: string | null;
  notes: string | null;
}

export interface HomeDashboardData {
  stats: HomeStats;
  latestOrders: LatestOrder[];
}
