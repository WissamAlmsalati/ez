export type OrderWindow = {
  id: number;
  dayOfWeek: number; // 0-6
  dayName: string; // Sunday, ...
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  isActive: boolean;
  statusText?: string;
  timeText?: string;
  isCurrentlyOpen?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderWindowsResponse = {
  data: OrderWindow[];
  meta?: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
};
