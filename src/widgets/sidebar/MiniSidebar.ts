export interface MiniiconsType {
  id: number;
  icon: string;
  tooltip: string;
}

const Miniicons: MiniiconsType[] = [
  { id: 1, icon: "solar:layers-line-duotone", tooltip: "لوحة التحكم" },
  { id: 2, icon: "solar:settings-line-duotone", tooltip: "الإعدادات" },
];

export default Miniicons;
