"use client";
import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Select, TextInput, Spinner } from "flowbite-react";
import { apiInstance } from "@/shared/api/axios";
import { useSessionStore } from "@/entities/session/model/sessionStore";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function EmployeeProductsReportModal({ open, onClose }: Props) {
  const { isManager, isEmployee } = useSessionStore();
  const [reportType, setReportType] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
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
    if (isManager)
      return allOptions.filter((o) => o.value === "manager-dashboard");
    if (isEmployee)
      return allOptions.filter((o) => o.roles.includes("employee"));
    return allOptions;
  }, [allOptions, isManager, isEmployee]);

  // Default selection based on role when modal opens
  useEffect(() => {
    if (!open) return;
    if (isManager) {
      setReportType("manager-dashboard");
      return;
    }
    if (!reportType && allowedOptions.length > 0) {
      setReportType(allowedOptions[0].value);
    }
  }, [open, isManager, allowedOptions, reportType]);

  const selectedPath = useMemo(() => {
    if (isManager) return "/reports/manager/dashboard";
    const found = allOptions.find((o) => o.value === reportType);
    return found?.path;
  }, [allOptions, reportType, isManager]);

  const handleOpenInNewTab = async () => {
    setError(null);
    if (!selectedPath) {
      setError("يرجى اختيار نوع التقرير");
      return;
    }
    // Open a blank tab immediately to avoid popup blockers
    const reportWindow = window.open("about:blank", "_blank");
    if (!reportWindow) {
      setError("يجب السماح بالنوافذ المنبثقة لفتح التقرير في تبويب جديد");
      return;
    }
    try {
      setLoading(true);
      reportWindow.document.write(
        "<p style='font-family: sans-serif'>جاري تحميل التقرير…</p>"
      );
      const params: Record<string, string> = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await apiInstance.get(selectedPath, {
        params,
        responseType: "text" as any,
        headers: { Accept: "text/html" },
      });
      const html = typeof res.data === "string" ? res.data : String(res.data);
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
          {!isManager && (
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
          )}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block mb-1 text-sm">من تاريخ</label>
              <TextInput
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm">إلى تاريخ</label>
              <TextInput
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </Modal.Body>
      <Modal.Footer className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {fromDate || toDate ? (
            <span>
              الفترة: {fromDate || "—"} إلى {toDate || "—"}
            </span>
          ) : (
            <span>بدون تحديد فترة</span>
          )}
        </div>
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
            disabled={loading || (!isManager && !reportType)}
          >
            فتح التقرير في تبويب
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
