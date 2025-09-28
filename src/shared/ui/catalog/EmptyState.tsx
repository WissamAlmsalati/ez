export default function EmptyState({
  title = "لا توجد بيانات",
}: {
  title?: string;
}) {
  return (
    <div className="w-full rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500">
      {title}
    </div>
  );
}
