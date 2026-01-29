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
        label: "تقرير الموظف - الأصناف والكميات",
        roles: ["employee"],
        path: "/reports/employee/products",
      },
      {
        value: "employee-products-by-store",
        label: "تقرير الموظف - الأصناف حسب المتجر",
        roles: ["employee"],
        path: "/reports/employee/products-by-store",
      },
      {
        value: "manager-dashboard",
        label: "تقرير المدير - حسب المتاجر",
        roles: ["manager"],
        path: "/reports/manager/dashboard",
      },
      {
        value: "manager-by-categories",
        label: "تقرير المدير - حسب الأقسام",
        roles: ["manager"],
        path: "/reports/manager/by-categories",
      },
      {
        value: "manager-quantities-by-categories",
        label: "تقرير المدير - كميات لكل قسم",
        roles: ["manager"],
        path: "/reports/manager/quantities-by-categories",
      },
    ],
    [],
  );

  const allowedOptions: ReportOption[] = useMemo(() => {
    // Separate visibility: managers see manager reports only; employees see employee reports only
    if (isManager) return allOptions.filter((o) => o.roles.includes("manager"));
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

  // --- Common helpers & base styled shell (RTL print-friendly) ---
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

  const renderShell = (
    title: string,
    date: string,
    innerHtml: string,
  ) => `<!DOCTYPE html>
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
    .brandbar { display:flex; align-items:center; justify-content:right; gap:32px;  }
    .header{font-size:20px; font-weight:500; color:var(--primary);} 
    .brand-left { display:flex; flex-direction: column; align-items:right; gap:4px; }
    .logo { width:56px; height:100px; object-fit:contain; }
    .doc-title { text-align:center; margin:18px 0 8px; font-size:24px; font-weight:800; color:var(--accent); letter-spacing:.5px; }
    .meta { text-align:center; color:var(--muted); font-size:14px; margin-bottom:18px; font-weight:600 }
    section.block { margin: 26px 0 34px; page-break-inside: avoid; }
    section.block h3 { margin:0 0 10px; font-size:18px; font-weight:700; display:flex; align-items:center; gap:8px; }
    section.block h3 .sub {  font-weight:500; font-size:14px; color:var(--muted); }
    .table-wrapper { overflow:auto; border:1px solid var(--border); border-radius:0px; background:var(--bg); }
    table { width:100%; border-collapse:collapse; font-size:14px; text-align:center; border-radius:0; }
    th, td { padding:10px 12px; border-bottom:1px solid var(--border); text-align:center; border-radius:0; }
    th { background:#f1f5f9; color:#0f172a; font-weight:800; font-size:13px; text-align:center; }
    tbody tr:nth-child(even) { background:#fafafa; }
    tbody tr:hover { background:#f5faff; }
    td.num { text-align:center; font-variant-numeric: tabular-nums; direction:ltr; }
    td.c, th.c { text-align:center; }
    .muted { color:var(--muted); }
    .footer { margin-top:26px; text-align:center; color:var(--muted); font-size:12px; }
    .actions { position:fixed; top:12px; left:16px; display:flex; gap:8px; z-index:50; }
    .btn { background:#111827; color:#fff; border:none; padding:8px 14px; font-size:12px; border-radius:8px; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,.15); }
    .btn.secondary { background:#6b7280; }
    @media print {
      html,body { background:#fff; }
      .sheet { margin: 0; border: none; border-radius:0; box-shadow:none; padding: 0 6mm 8mm; }
      .actions { display:none; }
      .brandbar { padding: 3mm 0 0mm; }
      .doc-title { margin: 3mm 0 0; }
    }
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
      <img class="logo" src="/BLUE AND GOLD SCG.svg" alt="Izdihar Sweets" />
      <div class="brand-left header">
        <div> شركة الازدهار للحلويات</div>
        <div>${esc(title)}</div>
        <div>${esc(date || "")}</div>
      </div>
    </div>
    <hr/>
    ${innerHtml}
    <div class="footer">مملوك لشركة الازدهار للحلويات — &copy; ${new Date().getFullYear()}</div>
  </div>
</body>
</html>`;

  // Manager: dashboard (grouped by stores)
  const buildManagerDashboardHtml = (data: any) => {
    if (!data || typeof data !== "object") return null;
    const title = data.report_title || "تقرير المدير - حسب المتاجر";
    const date = data.date || "";
    const stores: any[] = Array.isArray(data.stores) ? data.stores : [];

    const sections = stores
      .map((s) => {
        const items = Array.isArray(s.items) ? s.items : [];

        // دمج الصفوف المتكررة
        const mergedItems = items.reduce((acc: any[], item: any) => {
          const existingItem = acc.find(
            (i) =>
              i.productName === item.productName &&
              i.unitName === item.unitName &&
              i.storeName === item.storeName &&
              i.categoryName === item.categoryName     // Ensure all fields match exactly
          );
          if (existingItem) {
            existingItem.quantity = `${existingItem.quantity}, ${item.quantity}`; // Merge quantities only
          } else {
            acc.push({ ...item }); // Add new item if no match
          }
          return acc;
        }, []);

        const rows = mergedItems
          .map(
            (it: any, idx: number) => `
          <tr>
            <td class="c">${idx + 1}</td>
            <td>${esc(it.category_name ?? it.categoryName)}</td>
            <td>${esc(it.product_name ?? it.productName)}</td>
            <td>${esc(it.unit_name ?? it.unitName ?? it.unit)}</td>
            <td class="num">${esc(it.quantity)}</td>
            <td>${esc(it.notes ?? "")}</td>
            <td class="c">${it.hasImage ? "📷" : ""}</td>
          </tr>`,
          )
          .join("");

        const rowsContent =
          rows ||
          '<tr><td colspan="7" class="muted c">لا توجد بيانات</td></tr>';

        return `
        <section class="block">
          <h3>${esc(s.store_name ?? s.storeName)} <span class="sub">(${
            items.length
          } صنف)</span></h3>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th class="c" style="width:50px">#</th>
                  <th>القسم</th>
                  <th>الصنف</th>
                  <th style="width:140px">الوحدة</th>
                  <th style="width:120px">الكمية</th>
                  <th>ملاحظات</th>
                  <th style="width:60px">صورة</th>
                </tr>
              </thead>
              <tbody>${rowsContent}</tbody>
            </table>
          </div>
        </section>`;
      })
      .join("\n");

    return renderShell(
      title,
      date,
      sections || '<p class="muted">لا توجد بيانات</p>',
    );
  };

  // Manager: by categories (grouped by category, shows stores)
  const buildManagerByCategoriesHtml = (data: any) => {
    if (!data || typeof data !== "object") return null;
    const title = data.report_title || "تقرير المدير - حسب الأقسام";
    const date = data.date || "";
    const cats: any[] = Array.isArray(data.categories) ? data.categories : [];

    const sections = cats
      .map((c) => {
        const items = Array.isArray(c.items) ? c.items : [];

        // دمج الصفوف المتكررة
        const mergedItems = items.reduce((acc: any[], item: any) => {
          const existingItem = acc.find(
            (i) =>
              i.product_name === item.product_name &&
              i.unit_name === item.unit_name &&
              i.storeName === item.storeName &&
              i.categoryName === item.categoryName // Ensure all fields match exactly
          );
          if (existingItem) {
            existingItem.quantity = `${existingItem.quantity}, ${item.quantity}`; // Merge quantities only
          } else {
            acc.push({ ...item }); // Add new item if no match
          }
          return acc;
        }, []);

        const rows = mergedItems
          .map(
            (it: any, idx: number) => `
          <tr>
            <td class="c">${idx + 1}</td>
            <td>${esc(it.store_name ?? it.storeName)}</td>
            <td>${esc(it.product_name ?? it.productName)}</td>
            <td>${esc(it.unit_name ?? it.unitName)}</td>
            <td class="num">${esc(it.quantity)}</td>
            <td>${esc(it.notes ?? "")}</td>
            <td class="c">${it.hasImage ? "📷" : ""}</td>
          </tr>`,
          )
          .join("");

        const rowsContent =
          rows ||
          '<tr><td colspan="7" class="muted c">لا توجد بيانات</td></tr>';

        return `
        <section class="block">
          <h3>${esc(c.category_name ?? c.categoryName)} <span class="sub">(${
            items.length
          } عنصر)</span></h3>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th class="c" style="width:50px">#</th>
                  <th>المتجر</th>
                  <th>الصنف</th>
                  <th style="width:140px">الوحدة</th>
                  <th style="width:120px">الكمية</th>
                  <th>ملاحظات</th>
                  <th style="width:60px">صورة</th>
                </tr>
              </thead>
              <tbody>${rowsContent}</tbody>
            </table>
          </div>
        </section>`;
      })
      .join("\n");

    return renderShell(
      title,
      date,
      sections || '<p class="muted">لا توجد بيانات</p>',
    );
  };

  // Manager: quantities by categories (aggregate quantities)
  const buildManagerQuantitiesByCategoriesHtml = (data: any) => {
    if (!data || typeof data !== "object") return null;
    const title = data.report_title || "تقرير المدير - الكميات لكل قسم";
    const date = data.date || "";
    const cats: any[] = Array.isArray(data.categories) ? data.categories : [];
    const sections = cats
      .map((c) => {
        const items = Array.isArray(c.items) ? c.items : [];
        const rows = items
          .map(
            (it: any, idx: number) => `
          <tr>
            <td class="c">${idx + 1}</td>
            <td>${esc(it.product_name ?? it.productName)}</td>
            <td>${esc(it.unit_name ?? it.unitName)}</td>
            <td class="num">${formatNumber(it.quantity)}</td>
            <td>${esc(it.notes ?? "")}</td>
            <td class="c">${it.hasImage ? "📷" : ""}</td>
          </tr>`,
          )
          .join("");

        const rowsContent =
          rows ||
          '<tr><td colspan="6" class="muted c">لا توجد بيانات</td></tr>';

        return `
        <section class="block">
          <h3>${esc(c.category_name ?? c.categoryName)} <span class="sub">(${
            items.length
          } عنصر)</span></h3>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th class="c" style="width:50px">#</th>
                  <th>الصنف</th>
                  <th style="width:140px">الوحدة</th>
                  <th style="width:120px">الكمية</th>
                  <th>ملاحظات</th>
                  <th style="width:60px">صورة</th>
                </tr>
              </thead>
              <tbody>${rowsContent}</tbody>
            </table>
          </div>
        </section>`;
      })
      .join("\n");
    return renderShell(
      title,
      date,
      sections || '<p class="muted">لا توجد بيانات</p>',
    );
  };

  // Employee: products (single category summary)
  const buildEmployeeProductsHtml = (data: any) => {
    if (!data || typeof data !== "object") return null;
    const title = data.report_title || "تقرير الموظف - الأصناف والكميات";
    const date = data.date || "";
    const items: any[] = Array.isArray(data.items) ? data.items : [];

    // دمج الصفوف المتكررة
    const mergedItems = items.reduce((acc: any[], item: any) => {
      const existingItem = acc.find(
        (i) =>
          i.product_name === item.product_name &&
          i.unit_name === item.unit_name &&
          i.storeName === item.storeName &&
          i.categoryName === item.categoryName // Ensure all fields match exactly
      );
      if (existingItem) {
        existingItem.quantity += `, ${item.quantity}`;
      } else {
        acc.push({ ...item, quantity: `${item.quantity}` });
      }
      return acc;
    }, []);

    const rows = mergedItems
      .map(
        (it: any, idx: number) => `
      <tr>
        <td class="c">${idx + 1}</td>
        <td>${esc(it.product_name ?? it.productName)}</td>
        <td>${esc(it.unit_name ?? it.unitName)}</td>
        <td class="num">${esc(it.quantity)}</td>
        <td>${esc(it.notes ?? "")}</td>
        <td class="c">${it.hasImage ? "📷" : ""}</td>
      </tr>`,
      )
      .join("");

    const rowsContent =
      rows || '<tr><td colspan="6" class="muted c">لا توجد بيانات</td></tr>';

    const content = `
      <div class="doc-title">${esc(
        (data.category_name ?? data.categoryName) || "",
      )}</div>
      <div class="meta">${esc(date)}</div>
      <section class="block">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th class="c" style="width:50px">#</th>
                <th>الصنف</th>
                <th style="width:140px">الوحدة</th>
                <th style="width:120px">الكمية</th>
                <th>ملاحظات</th>
                <th style="width:60px">صورة</th>
              </tr>
            </thead>
            <tbody>${rowsContent}</tbody>
          </table>
        </div>
      </section>`;
    return renderShell(title, date, content);
  };

  // Employee: products by store (flat list with store and product)
  const buildEmployeeProductsByStoreHtml = (data: any) => {
    if (!data || typeof data !== "object") return null;
    const title = data.report_title || "تقرير الموظف - الأصناف حسب المتجر";
    const date = data.date || "";
    const items: any[] = Array.isArray(data.items) ? data.items : [];
    const mergedItems = items.reduce((acc: any[], item: any) => {
      const existingItem = acc.find(
        (i) =>
          (i.storeName === item.storeName) &&
          (i.productName === item.productName) &&
          (i.unitName === item.unitName),
      );
      if (existingItem) {
        existingItem.quantity += `, ${item.quantity}`;
      } else {
        acc.push({ ...item, quantity: `${item.quantity}` });
      }
      return acc;
    }, []);

    const rows = mergedItems
      .map(
        (it: any, idx: number) => `
      <tr>
        <td class="c">${idx + 1}</td>
        <td>${esc(it.storeName)}</td>
        <td>${esc(it.productName)}</td>
        <td>${esc(it.unitName)}</td>
        <td class="num">${esc(it.quantity)}</td>
        <td>${esc(it.notes ?? "")}</td>
        <td class="c">${it.hasImage ? "📷" : ""}</td>
      </tr>`,
      )
      .join("");
    const rowsContent =
      rows || '<tr><td colspan="7" class="muted c">لا توجد بيانات</td></tr>';

    const content = `
      <div class="doc-title">${esc(
        (data.categoryName) || "",
      )}</div>
      <div class="meta">${esc(date)}</div>
      <section class="block">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th class="c" style="width:50px">#</th>
                <th>المتجر</th>
                <th>الصنف</th>
                <th style="width:140px">الوحدة</th>
                <th style="width:120px">الكمية</th>
                <th>ملاحظات</th>
                <th style="width:60px">صورة</th>
              </tr>
            </thead>
            <tbody>${rowsContent}</tbody>
          </table>
        </div>
      </section>`;
    return renderShell(title, date, content);
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
    pre{background:#0f172a;color:#f8fafc;padding:16px;border-radius:0px;overflow:auto;font-size:14px;direction:ltr;text-align:left}
    .actions{position:fixed;top:12px;left:16px;display:flex;gap:8px}
    .btn{background:#111827;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer}
    @media print{.actions{display:none}.sheet{margin:0;border:none;border-radius:0}}
  </style>
  <script>function doPrint(){window.print()}</script>
  </head>
<body>
  <div class="actions"><button class="btn" onclick="doPrint()">طباعة</button></div>
  <div class="sheet">
    <div class="head"><img class="logo" src="/BLUE AND GOLD SCG.svg" alt="Izdihar"/><div class="title">بيانات التقرير </div></div>
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
        "<p style='font-family:sans-serif'>جاري تحميل التقرير…</p>",
      );
      const res = await apiInstance.get(selectedPath, {
        headers: { Accept: "application/json" },
      });
      // New API wraps payload as { success, data }
      const payload = res?.data?.data ?? res?.data;
      let html: string | null = null;
      switch (reportType) {
        case "manager-dashboard":
          html = buildManagerDashboardHtml(payload);
          break;
        case "manager-by-categories":
          html = buildManagerByCategoriesHtml(payload);
          break;
        case "manager-quantities-by-categories":
          html = buildManagerQuantitiesByCategoriesHtml(payload);
          break;
        case "employee-products":
          html = buildEmployeeProductsHtml(payload);
          break;
        case "employee-products-by-store":
          html = buildEmployeeProductsByStoreHtml(payload);
          break;
        default:
          html = buildFallbackHtml(payload);
      }
      if (!html) html = buildFallbackHtml(payload);
      reportWindow.document.open();
      reportWindow.document.write(html);
      reportWindow.document.close();
      reportWindow.focus();
    } catch (e: any) {
      reportWindow.document.body.innerHTML = `<p style='color:red;font-family:sans-serif'>فشل في تحميل التقرير</p>`;
      setError(
        e?.response?.data?.message || "فشل في تحميل التقرير، حاول لاحقاً",
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
