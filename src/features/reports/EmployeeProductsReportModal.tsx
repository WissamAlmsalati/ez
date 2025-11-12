"use client";
import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Select, Spinner } from "flowbite-react";
import { apiInstance } from "@/shared/api/axios";
import { useSessionStore } from "@/entities/session/model/sessionStore";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function EmployeeProductsReportModal({ open, onClose }: Props) {
  const { isManager, isEmployee } = useSessionStore();
  const [reportType, setReportType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type ReportOption = {
    value: string;
    label: string;
    roles: ("employee" | "manager")[];
    path: string;
  };

  const allOptions: ReportOption[] = useMemo(
    () => [
      {
        value: "employee-products",
        label: "تقرير الأصناف والكميات",
        roles: ["employee"],
        path: "/reports/employee/products",
      },
      {
        value: "employee-products-by-store",
        label: "تقرير الأصناف حسب الزبون/المتجر",
        roles: ["employee"],
        path: "/reports/employee/products-by-store",
      },
      {
        value: "manager-dashboard",
        label: "تقرير المدير الشامل",
        roles: ["manager"],
        path: "/reports/manager/dashboard",
      },
    ],
    []
  );

  const allowedOptions: ReportOption[] = useMemo(() => {
    // Managers should see all report types
    if (isManager) return allOptions;
    if (isEmployee)
      return allOptions.filter((o) => o.roles.includes("employee"));
    return allOptions;
  }, [allOptions, isManager, isEmployee]);

  // Default selection based on role when modal opens (prefer manager dashboard for managers)
  useEffect(() => {
    if (!open) return;
    if (!reportType) {
      if (
        isManager &&
        allowedOptions.some((o) => o.value === "manager-dashboard")
      ) {
        setReportType("manager-dashboard");
      } else if (allowedOptions.length > 0) {
        setReportType(allowedOptions[0].value);
      }
    }
  }, [open, allowedOptions, reportType, isManager]);

  const selectedPath = useMemo(() => {
    const found = allOptions.find((o) => o.value === reportType);
    return found?.path;
  }, [allOptions, reportType]);

  /** Build a more formal, print-ready RTL HTML document from manager dashboard JSON */
  const buildManagerDashboardHtml = (data: any) => {
    if (!data || typeof data !== "object") return null;
    const title = data.report_title || "تقرير المدير";
    const generatedAt = data.generatedAt.split(" ")[0] || "";
    const summary = data.summary || {};
    const categories: any[] = Array.isArray(data.categories)
      ? data.categories
      : [];
    const esc = (v: any) =>
      String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    const formatNumber = (v: any) => {
      const n = Number(v);
      if (Number.isNaN(n)) return esc(v);
      try {
        return new Intl.NumberFormat("ar-LY", {
          maximumFractionDigits: 2,
        }).format(n);
      } catch {
        return String(n);
      }
    };
    const categorySections = categories
      .map((cat) => {
        const products = Array.isArray(cat.products) ? cat.products : [];
        const productRows = products
          .map(
            (p: any, i: number) => `
        <tr>
          <td class="c">${i + 1}</td>
          <td>${esc(p.name)}</td>
          <td class="c">${esc(p.unit)}</td>
          <td class="num">${formatNumber(p.price)}</td>
          <td>${(p.orderedBy || [])
            .map((n: string) => `${esc(n)}`)
            .join(", ")}</td>
        </tr>`
          )
          .join("");
        return `
      <section class="category">
        <h3>
          <span class="cat-title">${esc(cat.categoryName)}</span>
          <span class="count">(${esc(cat.itemsCount)} صنف)</span>
        </h3>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="width:50px" class="c">#</th>
                <th>الصنف</th>
                <th style="width:120px" class="c">الوحدة</th>
                <th style="width:120px" class="num">السعر</th>
                <th style="min-width:220px">الزبون</th>
              </tr>
            </thead>
            <tbody>${
              productRows ||
              '<tr><td colspan="5" class="muted c">لا توجد بيانات</td></tr>'
            }</tbody>
          </table>
        </div>
      </section>`;
      })
      .join("\n");
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <style>
    :root { --accent:#0f172a; --primary:#111827; --muted:#6b7280; --border:#cbd5e1; --bg:#ffffff; --soft:#f8fafc; --brand:#2563eb; font-family: 'Arial','Segoe UI',system-ui,-apple-system,sans-serif; }
    @page { size: A4; margin: 14mm 12mm; }
    html,body { background: var(--soft); }
    body { margin: 0; font-family: 'Arial','Segoe UI',system-ui,-apple-system,sans-serif; }
    .sheet { margin: 16px; background: var(--bg); padding: 24px 24px 40px; border: 1px solid var(--border); border-radius: 0px; box-shadow: 0 4px 16px rgba(0,0,0,.06); }
    .brandbar { display:flex;  align-items:center; justify-content:center; gap:12px; padding-bottom: 12px; }
    .brand-left { display:flex; flex-direction: column; align-items:center; gap:12px; }
    .logo { width:100px; height:100px; object-fit:contain; }
    .org { font-size:18px; font-weight:700; color:var(--primary); }
    .org-sub { font-size:12px; color:var(--muted); }
    .doc-title { text-align:center; margin:18px 0 8px; font-size:22px; font-weight:800; color:var(--accent); letter-spacing:.5px; }
    .generated { text-align:center; font-weight:600; }
    .meta { display:flex; gap:24px; justify-content:center; color:var(--muted); font-size:12px; margin-bottom:18px; }
    .hr { height:1px; background:linear-gradient(to left, transparent, black, transparent); margin:12px 0 20px; }
    .summary-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:6px; margin:10px 0 28px; }
    .card { background:var(--bg); border:1px solid var(--border); border-radius:0px; padding:12px 14px; }
    .card h4 { margin:0 0 6px; font-size:12px; font-weight:700; color:var(--muted); }
    .card .value { font-size:22px; font-weight:800; color:var(--primary); }
    section.category { margin: 26px 0 34px; page-break-inside: avoid; }
    section.category h3 { margin:0 0 10px; font-size:16px; font-weight:800;  display:flex; align-items:center; gap:8px; }
    section.category h3 .cat-title { padding:3px 10px; border-radius:0px; }
    section.category h3 .count {  font-weight:500; font-size:12px; }
    .table-wrapper { overflow:auto; border:1px solid var(--border); border-radius:0px; background:var(--bg); }
  table { width:100%; border-collapse:collapse; font-size:12px; text-align:center; border-radius:0; }
  th, td { padding:10px 12px; border-bottom:1px solid var(--border); text-align:center; border-radius:0; }
  th { background:#f1f5f9; color:#0f172a; font-weight:800; font-size:11px; text-align:center; }
    tbody tr:nth-child(even) { background:#fafafa; }
    tbody tr:hover { background:#f5faff; }
    td.num { text-align:center; font-variant-numeric: tabular-nums; direction:ltr; }
    td.c, th.c { text-align:center; }
    .badge { background:#2563eb; color:white; padding:3px 8px; border-radius:999px; font-size:10px; margin:2px; display:inline-block; }
    .muted { color:var(--muted); }
    .signatures { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:36px; }
    .sig { text-align:center; }
    .sig .line { height:1px; background:var(--border); margin:28px 0 6px; }
    .footer { margin-top:26px; text-align:center; color:var(--muted); font-size:11px; }
    .actions { position:fixed; top:12px; left:16px; display:flex; gap:8px; z-index:50; }
    .btn { background:#111827; color:#fff; border:none; padding:8px 14px; font-size:12px; border-radius:8px; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,.15); }
    .btn.secondary { background:#6b7280; }
    @media print {
      html,body { background:#fff; }
      .sheet { margin: 0; border: none; border-radius:0; box-shadow:none; padding: 0 6mm 8mm; }
      .actions { display:none; }
      .brandbar { padding: 6mm 0 3mm; border-bottom: 2px solid var(--primary); }
      .doc-title { margin: 3mm 0 0; }
    }
    /* * Optional subtle watermark: uncomment to enable */
    /* body::before { content:"الازدهار للحلويات"; position:fixed; inset:0; display:flex; align-items:center; justify-content:center; font-size:64px; color:#0f172a; opacity:0.03; pointer-events:none; font-weight:800; } */
    * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  </style>
  <script>
    function doPrint(){ window.print(); }
    function closeTab(){ window.close(); }
    window.addEventListener('keydown', (e)=>{ if(e.key==='p' && (e.metaKey||e.ctrlKey)){ setTimeout(()=>doPrint(),50); } });
  </script>
</head>
<body>
  <div class="actions">
    <button class="btn" onclick="doPrint()">طباعة</button>
    <button class="btn secondary" onclick="closeTab()">إغلاق</button>
  </div>
  <div class="sheet">

    <div class="brandbar">
      <div class="brand-left ">
        <img class="logo" src="/Izdihar_logo_report.svg" alt="Izdihar Sweets" />
      </div>
      <div></div>
      </div>
      <div class="hr"></div>
    <div class="summary-cards">
      ${
        summary.totalStores !== undefined
          ? `<div class="card"><h4>عدد المتاجر</h4><div class="value">${formatNumber(
              summary.totalStores
            )}</div></div>`
          : ""
      }
      ${
        summary.totalCategories !== undefined
          ? `<div class="card"><h4>عدد الأقسام</h4><div class="value">${formatNumber(
              summary.totalCategories
            )}</div></div>`
          : ""
      }
      ${
        summary.totalItems !== undefined
          ? `<div class="card"><h4>عدد الأصناف</h4><div class="value">${formatNumber(
              summary.totalItems
            )}</div></div>`
          : ""
      }
      ${
        summary.totalOrders !== undefined
          ? `<div class="card"><h4>عدد الطلبات</h4><div class="value">${formatNumber(
              summary.totalOrders
            )}</div></div>`
          : ""
      }
      </div>
      ${categorySections}

    <div class="footer"> مملوك لشركة الازدهار للحلويات — &copy; ${new Date().getFullYear()}</div>
  </div>
</body>
</html>`;
  };

  const buildFallbackHtml = (json: any) => {
    const pretty = JSON.stringify(json, null, 2).replace(/</g, "&lt;");
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8"/>
  <title>تقرير</title>
  <style>
    :root { --border:#cbd5e1; --muted:#64748b; font-family: 'Arial','Segoe UI',sans-serif; }
    body{margin:0;background:#f8fafc;font-family:'Arial','Segoe UI',sans-serif;}
    .sheet{margin:16px;background:#fff;border:1px solid var(--border);border-radius:0px;padding:16px 20px;font-family:'Arial','Segoe UI',sans-serif;}
    .head{display:flex;align-items:center;gap:12px;border-bottom:2px solid #111827;padding-bottom:10px;margin-bottom:12px;}
    .logo{width:56px;height:56px;object-fit:contain}
    .title{font-weight:800}
    pre{background:#0f172a;color:#f8fafc;padding:16px;border-radius:0px;overflow:auto;font-size:12px;direction:ltr;text-align:left}
    .actions{position:fixed;top:12px;left:16px;display:flex;gap:8px}
    .btn{background:#111827;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer}
    @media print{.actions{display:none}.sheet{margin:0;border:none;border-radius:0}}
  </style>
  <script>function doPrint(){window.print()}</script>
  </head>
<body>
  <div class="actions"><button class="btn" onclick="doPrint()">طباعة</button></div>
  <div class="sheet">
    <div class="head"><img class="logo" src="/Izdihar_logo_report.svg" alt="Izdihar"/><div class="title">بيانات التقرير (نص خام)</div></div>
    <pre>${pretty}</pre>
  </div>
</body>
</html>`;
  };

  const handleOpenInNewTab = async () => {
    setError(null);
    if (!selectedPath) {
      setError("يرجى اختيار نوع التقرير");
      return;
    }
    const reportWindow = window.open("about:blank", "_blank");
    if (!reportWindow) {
      setError("يجب السماح بالنوافذ المنبثقة لفتح التقرير في تبويب جديد");
      return;
    }
    try {
      setLoading(true);
      reportWindow.document.write(
        "<p style='font-family:sans-serif'>جاري تحميل التقرير…</p>"
      );
      const res = await apiInstance.get(selectedPath, {
        headers: { Accept: "application/json" },
      });
      const data = res.data;
      let html: string | null = null;
      if (reportType === "manager-dashboard" || data?.report_title) {
        html = buildManagerDashboardHtml(data);
      }
      if (!html) html = buildFallbackHtml(data);
      reportWindow.document.open();
      reportWindow.document.write(html);
      reportWindow.document.close();
      reportWindow.focus();
    } catch (e: any) {
      reportWindow.document.body.innerHTML = `<p style='color:red;font-family:sans-serif'>فشل في تحميل التقرير</p>`;
      setError(
        e?.response?.data?.message || "فشل في تحميل التقرير، حاول لاحقاً"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={open} onClose={onClose} size="2xl" dismissible>
      <Modal.Header>استخراج تقرير</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">نوع التقرير</label>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {allowedOptions.map((opt: ReportOption) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </Modal.Body>
      <Modal.Footer className="flex items-center justify-end">
        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner size="sm" />
              <span>جاري التحميل…</span>
            </div>
          )}
          <Button color="outlineprimary" onClick={onClose}>
            إغلاق
          </Button>
          <Button
            color={"primary"}
            onClick={handleOpenInNewTab}
            disabled={loading || !reportType}
          >
            فتح التقرير في تبويب
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
