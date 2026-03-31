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
    @page { size: A4; margin: 10mm 10mm; }
    html,body { background: var(--soft); }
    body { margin: 0; font-family: 'Arial','Segoe UI',system-ui,-apple-system,sans-serif; }
    .sheet { margin: 16px; background: var(--bg); padding: 16px 16px 24px; border: 1px solid var(--border); border-radius: 0px; box-shadow: 0 4px 16px rgba(0,0,0,.06); }
    .brandbar { display:flex; align-items:center; justify-content:right; gap:20px;  }
    .header{font-size:16px; font-weight:500; color:var(--primary);} 
    .brand-left { display:flex; flex-direction: column; align-items:right; gap:2px; }
    .logo { width:48px; height:60px; object-fit:contain; }
    .doc-title { text-align:center; margin:12px 0 6px; font-size:20px; font-weight:800; color:var(--accent); letter-spacing:.5px; }
    .meta { text-align:center; color:var(--muted); font-size:12px; margin-bottom:12px; font-weight:600 }
    section.block { margin: 16px 0 20px; break-inside: auto !important; page-break-inside: auto !important; }
    section.block h3 { margin:0 0 6px; font-size:16px; font-weight:700; display:flex; align-items:center; gap:6px; }
    section.block h3 .sub {  font-weight:500; font-size:12px; color:var(--muted); }
    .table-wrapper { overflow:auto; border:1px solid var(--border); border-radius:0px; background:var(--bg); break-inside: auto !important; page-break-inside: auto !important; }
    table { width:100%; border-collapse:collapse; font-size:12px; text-align:center; border-radius:0; break-inside: auto !important; page-break-inside: auto !important; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    th, td { padding:6px 8px; border-bottom:1px solid var(--border); text-align:center; border-radius:0; }
    th { background:#ffffff; color:#0f172a; font-weight:800; font-size:12px; text-align:center; }
    tbody tr { background:#ffffff; }
    td.num { text-align:center; font-variant-numeric: tabular-nums; direction:ltr; }
    td.no-wrap { white-space: nowrap; max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
    td.c, th.c { text-align:center; }
    .muted { color:var(--muted); }
    .footer { margin-top:26px; text-align:center; color:var(--muted); font-size:12px; }
    .multi-columns { column-count: 1; column-gap: 16px; }
    .mini-table { width:100%; }
    .actions { position:fixed; top:12px; left:16px; display:flex; gap:8px; z-index:50; }
    .btn { background:#111827; color:#fff; border:none; padding:8px 14px; font-size:12px; border-radius:8px; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,.15); }
    .btn.secondary { background:#6b7280; }
    @media print {
      html,body { background:#fff; }
      .multi-columns { column-count: 2; column-fill: auto; }
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
      <!-- Logo and Company Name removed as requested -->
      <div class="brand-left header" style="flex-direction: row; justify-content: space-between; width: 100%;">
        <div style="font-weight:bold; font-size:18px;">${esc(title)}</div>
        <div>${esc(date || "")}</div>
      </div>
    </div>
    <hr/>
    ${innerHtml}
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

        // دمج الصفوف المتكررة مع جمع الملاحظات والصور
        const mergedItems = items.reduce((acc: any[], item: any) => {
          const note = (item.notes?.desc ?? "").trim();
          const hasImg = !!item.hasImage || !!item.notes?.desc_image;
          const existingItem = acc.find(
            (i) =>
              (i.product_name ?? i.productName) ===
                (item.product_name ?? item.productName) &&
              (i.unit_name ?? i.unitName) ===
                (item.unit_name ?? item.unitName) &&
              i.storeName === item.storeName &&
              i.categoryName === item.categoryName &&
              (i._noteText ?? "") === note &&
              !!i._hasImage === hasImg,
          );

          if (existingItem) {
            existingItem.quantity = `${existingItem.quantity}, ${item.quantity}`;
            if (!existingItem._notesArr) existingItem._notesArr = [];
            if (note && !existingItem._notesArr.includes(note)) {
              existingItem._notesArr.push(note);
            }
          } else {
            acc.push({
              ...item,
              quantity: `${item.quantity}`,
              _notesArr: note ? [note] : [],
              _hasImage: hasImg,
              _noteText: note,
            });
          }
          return acc;
        }, []);

        // ترتيب الصفوف حسب الملاحظات والصور
        const sortedMergedItems = mergedItems.slice().sort((a: any, b: any) => {
          const tier = (item: any) => {
            const hasNotes = item._notesArr && item._notesArr.length > 0;
            const hasImage = !!item._hasImage;
            if (!hasNotes && !hasImage) return 0;
            if (hasNotes && !hasImage) return 1;
            if (!hasNotes && hasImage) return 2;
            return 3;
          };
          const productCompare = (
            a.product_name ??
            a.productName ??
            ""
          ).localeCompare(b.product_name ?? b.productName ?? "");
          if (productCompare !== 0) return productCompare;
          const unitCompare = (a.unit_name ?? a.unitName ?? "").localeCompare(
            b.unit_name ?? b.unitName ?? "",
          );
          if (unitCompare !== 0) return unitCompare;
          return tier(a) - tier(b);
        });
        const rows = sortedMergedItems
          .map((it: any, idx: number) => {
            let notesHtml = "";
            if (it._notesArr && it._notesArr.length) {
              notesHtml = it._notesArr.map(esc).join("<br/>");
            }
            return `
          <tr>
            <td class="muted">${idx + 1}</td>
            <td>${esc(it.category_name ?? it.categoryName)}</td>
            <td>${esc(it.product_name ?? it.productName)}</td>
            <td>${esc(it.unit_name ?? it.unitName ?? it.unit)}</td>
            <td class="num">${esc(it.quantity)}</td>
            <td>${notesHtml}</td>
            <td class="c">${it._hasImage ? "📷" : ""}</td>
          </tr>`;
          })
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
                  <th style="width:30px">#</th>
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

        // دمج الصفوف المتكررة مع جمع الملاحظات والصور
        const mergedItems = items.reduce((acc: any[], item: any) => {
          const note = (item.notes?.desc ?? "").trim();
          const hasImg = !!item.hasImage || !!item.notes?.desc_image;
          const existingItem = acc.find(
            (i) =>
              (i.product_name ?? i.productName) ===
                (item.product_name ?? item.productName) &&
              (i.unit_name ?? i.unitName) ===
                (item.unit_name ?? item.unitName) &&
              i.storeName === item.storeName &&
              i.categoryName === item.categoryName &&
              (i._noteText ?? "") === note &&
              !!i._hasImage === hasImg,
          );
          if (existingItem) {
            existingItem.quantity = `${existingItem.quantity}, ${item.quantity}`;
            if (!existingItem._notesArr) existingItem._notesArr = [];
            if (note && !existingItem._notesArr.includes(note)) {
              existingItem._notesArr.push(note);
            }
          } else {
            acc.push({
              ...item,
              quantity: `${item.quantity}`,
              _notesArr: note ? [note] : [],
              _hasImage: hasImg,
              _noteText: note,
            });
          }
          return acc;
        }, []);

        // ترتيب الصفوف حسب الملاحظات والصور
        const sortedMergedItems = mergedItems.slice().sort((a: any, b: any) => {
          const tier = (item: any) => {
            const hasNotes = item._notesArr && item._notesArr.length > 0;
            const hasImage = !!item._hasImage;
            if (!hasNotes && !hasImage) return 0;
            if (hasNotes && !hasImage) return 1;
            if (!hasNotes && hasImage) return 2;
            return 3;
          };
          const productCompare = (
            a.product_name ??
            a.productName ??
            ""
          ).localeCompare(b.product_name ?? b.productName ?? "");
          if (productCompare !== 0) return productCompare;
          const unitCompare = (a.unit_name ?? a.unitName ?? "").localeCompare(
            b.unit_name ?? b.unitName ?? "",
          );
          if (unitCompare !== 0) return unitCompare;
          return tier(a) - tier(b);
        });
        const rows = sortedMergedItems
          .map((it: any, idx: number) => {
            let notesHtml = "";
            if (it._notesArr && it._notesArr.length) {
              notesHtml = it._notesArr.map(esc).join("<br/>");
            }
            return `
          <tr>
            <td class="muted">${idx + 1}</td>
            <td>${esc(it.store_name ?? it.storeName)}</td>
            <td class="no-wrap">${esc(it.product_name ?? it.productName)}</td>
            <td>${esc(it.unit_name ?? it.unitName)}</td>
            <td class="num">${esc(it.quantity)}</td>
            <td>${notesHtml}</td>
            <td class="c">${it._hasImage ? "📷" : ""}</td>
          </tr>`;
          })
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
                  <th style="width:30px">#</th>
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
            <td class="muted">${idx + 1}</td>
            <td class="no-wrap">${esc(it.product_name ?? it.productName)}</td>
            <td>${esc(it.unit_name ?? it.unitName)}</td>
            <td class="num">${formatNumber(it.quantity)}</td>
            <td>${esc(it.notes.desc ?? "")}</td>
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
                  <th style="width:30px">#</th>
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

    // دمج الصفوف المتكررة: نفس الصنف ونفس الوحدة => نجمع الكميات، ونجمع الملاحظات والصور
    const mergedItems = items.reduce((acc: any[], item: any) => {
      const note = (item.notes?.desc ?? "").trim();
      const hasImg = !!item.hasImage || !!item.notes?.desc_image;
      const qty = Number(item.quantity) || 0;
      const existingItem = acc.find(
        (i) =>
          (i.product_name ?? i.productName) ===
            (item.product_name ?? item.productName) &&
          (i.unit_name ?? i.unitName) === (item.unit_name ?? item.unitName) &&
          i.storeName === item.storeName &&
          i.categoryName === item.categoryName,
      );
      if (existingItem) {
        const currentQty = Number(existingItem.quantity) || 0;
        existingItem.quantity = currentQty + qty;
        if (!existingItem._notesArr) existingItem._notesArr = [];
        if (note && !existingItem._notesArr.includes(note)) {
          existingItem._notesArr.push(note);
        }
        existingItem._hasImage = existingItem._hasImage || hasImg;
      } else {
        acc.push({
          ...item,
          quantity: qty,
          _notesArr: note ? [note] : [],
          _hasImage: hasImg,
        });
      }
      return acc;
    }, []);

    // ترتيب الصفوف حسب الملاحظات والصور
    const sortedMergedItems = mergedItems.slice().sort((a: any, b: any) => {
      const tier = (item: any) => {
        const hasNotes = item._notesArr && item._notesArr.length > 0;
        const hasImage = !!item._hasImage;
        if (!hasNotes && !hasImage) return 0;
        if (hasNotes && !hasImage) return 1;
        if (!hasNotes && hasImage) return 2;
        return 3;
      };
      const productCompare = (
        a.product_name ??
        a.productName ??
        ""
      ).localeCompare(b.product_name ?? b.productName ?? "");
      if (productCompare !== 0) return productCompare;
      const unitCompare = (a.unit_name ?? a.unitName ?? "").localeCompare(
        b.unit_name ?? b.unitName ?? "",
      );
      if (unitCompare !== 0) return unitCompare;
      return tier(a) - tier(b);
    });
    const rows = sortedMergedItems
      .map((it: any, idx: number) => {
        let notesHtml = "";
        if (it._notesArr && it._notesArr.length) {
          notesHtml = it._notesArr.map(esc).join("<br/>");
        }
        return `
      <tr>
        <td class="muted">${idx + 1}</td>
        <td class="no-wrap">${esc(it.product_name ?? it.productName)}</td>
        <td>${esc(it.unit_name ?? it.unitName)}</td>
        <td class="num">${formatNumber(it.quantity)}</td>
        <td>${notesHtml}</td>
        <td class="c">${it._hasImage ? "📷" : ""}</td>
      </tr>`;
      })
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
                <th style="width:30px">#</th>
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

  // Employee: products by store (grouped by store)
  const buildEmployeeProductsByStoreHtml = (data: any) => {
    if (!data || typeof data !== "object") return null;
    let title = data.report_title || "تقرير الموظف - الأصناف حسب المتجر";
    const categoryTitle = data.category_name || data.categoryName;
    if (categoryTitle) {
      title += ` - ${categoryTitle}`;
    }
    const date = data.date || "";
    const items: any[] = Array.isArray(data.items) ? data.items : [];

    // Group items by store_name
    const storesMap = new Map<string, any[]>();
    items.forEach((item) => {
      const storeName = item.store_name || item.storeName || "غير محدد";
      if (!storesMap.has(storeName)) {
        storesMap.set(storeName, []);
      }
      storesMap.get(storeName)?.push(item);
    });

    // Convert map to a flattened list of rows and distribute them into two
    // columns by filling the right column first, then spilling into the left.
    // This ensures when a store finishes and the next begins, it continues
    // under the last filled row rather than re-splitting per-store.
    const allEntries: string[] = [];
    const tableHead = `<thead>
          <tr>
            <th>الصنف</th>
            <th style="">الوحدة</th>
            <th style="">الكمية</th>
            <th>ملاحظات</th>
            <th style="">صورة</th>
          </tr>
        </thead>`;

    Array.from(storesMap.entries()).forEach(([storeName, storeItems]) => {
      // Merge duplicate items within the store (same product + unit + category)
      const mergedItems = storeItems.reduce((acc: any[], item: any) => {
        const note = (item.notes?.desc ?? "").trim();
        const hasImg = !!item.hasImage || !!item.notes?.desc_image;
        const qty = Number(item.quantity); // Keep as number if possible or handle string

        const existingItem = acc.find(
          (i) =>
            (i.product_name ?? i.productName) ===
              (item.product_name ?? item.productName) &&
            (i.unit_name ?? i.unitName) === (item.unit_name ?? item.unitName) &&
            (i._noteText ?? "") === note &&
            !!i._hasImage === hasImg,
        );

        if (existingItem) {
          existingItem.quantity = `${existingItem.quantity}, ${item.quantity}`;
          if (!existingItem._notesArr) existingItem._notesArr = [];
          if (note && !existingItem._notesArr.includes(note)) {
            existingItem._notesArr.push(note);
          }
        } else {
          acc.push({
            ...item,
            quantity: `${item.quantity}`,
            _notesArr: note ? [note] : [],
            _hasImage: hasImg,
            _noteText: note,
          });
        }
        return acc;
      }, []);

      // Sort items
      const sortedMergedItems = mergedItems.slice().sort((a: any, b: any) => {
        const tier = (item: any) => {
          const hasNotes = item._notesArr && item._notesArr.length > 0;
          const hasImage = !!item._hasImage;
          if (!hasNotes && !hasImage) return 0;
          if (hasNotes && !hasImage) return 1;
          if (!hasNotes && hasImage) return 2;
          return 3;
        };
        const typeCompare = (
          a.product_type_name ??
          a.productTypeName ??
          ""
        ).localeCompare(b.product_type_name ?? b.productTypeName ?? "");
        if (typeCompare !== 0) return typeCompare;
        const productCompare = (
          a.product_name ??
          a.productName ??
          ""
        ).localeCompare(b.product_name ?? b.productName ?? "");
        if (productCompare !== 0) return productCompare;
        return tier(a) - tier(b);
      });
      const rows = sortedMergedItems
        .map((it: any, idx: number) => {
          let notesHtml = "";
          if (it._notesArr && it._notesArr.length) {
            notesHtml = it._notesArr.map(esc).join("<br/>");
          }
          return `
          <tr>
            <td class="no-wrap">${esc(it.product_name ?? it.productName)}</td>
            <td>${esc(it.unit_name ?? it.unitName)}</td>
            <td class="num">${esc(it.quantity)}</td>
            <td>${notesHtml}</td>
            <td class="c">${it._hasImage ? "📷" : ""}</td>
          </tr>`;
        })
        .join("");

      // Build a mini-table block per store so CSS multi-column can flow them
      // sequentially into columns (right column first when RTL + column-fill:auto).
      const tableHead = `<thead>
          <tr>
            <th>الصنف</th>
            <th style="">الوحدة</th>
            <th style="">الكمية</th>
            <th>ملاحظات</th>
            <th style="">صورة</th>
          </tr>
        </thead>`;

      const miniTable = `
        <div class="mini-table" style="margin-bottom:8px;">
          <div style="font-weight:700; text-align:right; margin-bottom:6px;">${esc(
            storeName,
          )}</div>
          <div class="table-wrapper">
            <table>
              ${tableHead}
              <tbody>${rows || '<tr><td colspan="5" class="muted c">لا توجد بيانات</td></tr>'}</tbody>
            </table>
          </div>
        </div>`;
      allEntries.push(miniTable);
    });

    // If there are no entries, show empty message
    if (allEntries.length === 0) {
      const contentWithCategory = '<p class="muted">لا توجد بيانات</p>';
      return renderShell(title, date, contentWithCategory);
    }

    // Render using CSS multi-column so content fills the right column first
    // and then flows into the left on the same page when possible.
    // Allow the outer section to be split so content can start on page 1;
    // keep each `mini-table` marked with `break-inside: avoid` to keep
    // store header + its small table together.
    const contentWithCategory = `
      <section class="block">
          <div class="multi-columns" style="direction:rtl;">
            ${allEntries.join("")}
          </div>
        </section>`;

    return renderShell(title, date, contentWithCategory);
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
    <div class="head">
      <div class="title">بيانات التقرير</div>
    </div>
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
