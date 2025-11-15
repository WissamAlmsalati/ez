export type BlackoutPeriod = {
  id: number;
  reason: string;
  startsAt: string; // YYYY-MM-DD HH:mm:ss
  endsAt: string; // YYYY-MM-DD HH:mm:ss
  isActive: boolean;
  statusText?: string;
  isCurrent?: boolean;
  isExpired?: boolean;
  isUpcoming?: boolean;
  periodText?: string;
  daysRemaining?: number | null;
  affectsOrders?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderBlockStatus = {
  ordersBlocked: boolean;
  message: string;
  activePeriods: BlackoutPeriod[];
};
