"use client";

import React, { useMemo, useState } from "react";
import {
  useBlackoutPeriodsQuery,
  useCreateBlackoutPeriod,
  useUpdateBlackoutPeriod,
  useDeleteBlackoutPeriod,
  useOrderStatusQuery,
} from "@/entities/blackout/api";
import type { BlackoutPeriod } from "@/entities/blackout/types";
import { CardBox } from "@/shared/ui/cards";
import { Button, Label, Table, TextInput, Checkbox } from "flowbite-react";

type NewPeriod = {
  reason: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

export default function BlackoutPeriodsSection() {
  const { data: list = [], isLoading } = useBlackoutPeriodsQuery();
  const status = useOrderStatusQuery();
  const [newPeriod, setNewPeriod] = useState<NewPeriod>({
    reason: "",
    startsAt: "",
    endsAt: "",
    isActive: true,
  });
  const create = useCreateBlackoutPeriod();

  const upcoming = useMemo(
    () => list.filter((p) => p.isUpcoming && !p.isExpired),
    [list]
  );

  return (
    <div className="space-y-4">
      <CardBox className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              فترات التعطيل (إيقاف الطلبات)
            </h2>
            <p className="text-sm text-gray-500">
              أضف أو عدّل فترات يتم فيها إيقاف قبول الطلبات.
            </p>
          </div>
          {status.data?.ordersBlocked ? (
            <span className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
              الطلبات متوقفة الآن
            </span>
          ) : (
            <span className="rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              الطلبات متاحة
            </span>
          )}
        </div>

        <div className="rounded-lg border border-ld/60 bg-white p-4">
          <h3 className="mb-3 text-base font-medium">إضافة فترة جديدة</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500" htmlFor="reason">
                السبب
              </Label>
              <TextInput
                id="reason"
                placeholder="السبب"
                value={newPeriod.reason}
                onChange={(e) =>
                  setNewPeriod((s) => ({ ...s, reason: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500" htmlFor="startsAt">
                من
              </Label>
              <TextInput
                id="startsAt"
                type="datetime-local"
                value={toLocalInput(newPeriod.startsAt)}
                onChange={(e) =>
                  setNewPeriod((s) => ({
                    ...s,
                    startsAt: fromLocalInput(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500" htmlFor="endsAt">
                إلى
              </Label>
              <TextInput
                id="endsAt"
                type="datetime-local"
                value={toLocalInput(newPeriod.endsAt)}
                onChange={(e) =>
                  setNewPeriod((s) => ({
                    ...s,
                    endsAt: fromLocalInput(e.target.value),
                  }))
                }
              />
            </div>
            <div className="flex items-end justify-between gap-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={newPeriod.isActive}
                  onChange={(e) =>
                    setNewPeriod((s) => ({ ...s, isActive: e.target.checked }))
                  }
                />
                مفعل
              </label>
              <Button
                color="dark"
                onClick={() =>
                  create.mutate(newPeriod, {
                    onSuccess: () =>
                      setNewPeriod({
                        reason: "",
                        startsAt: "",
                        endsAt: "",
                        isActive: true,
                      }),
                  })
                }
                disabled={
                  create.isPending ||
                  !newPeriod.reason ||
                  !newPeriod.startsAt ||
                  !newPeriod.endsAt
                }
                isProcessing={create.isPending}
              >
                إضافة
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-base font-medium">القائمة</h3>
          {isLoading ? (
            <div className="text-sm text-gray-500">جاري التحميل...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="table-fixed centered-table white-header">
                <Table.Head className="border-b border-gray-200">
                  <Table.HeadCell>السبب</Table.HeadCell>
                  <Table.HeadCell>من</Table.HeadCell>
                  <Table.HeadCell>إلى</Table.HeadCell>
                  <Table.HeadCell>الحالة</Table.HeadCell>
                  <Table.HeadCell>إجراءات</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {list
                    .slice()
                    .sort((a, b) =>
                      (a.startsAt || "").localeCompare(b.startsAt || "")
                    )
                    .map((p) => (
                      <BlackoutRow key={p.id} p={p} />
                    ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      </CardBox>
    </div>
  );
}

function BlackoutRow({ p }: { p: BlackoutPeriod }) {
  const update = useUpdateBlackoutPeriod(p.id);
  const del = useDeleteBlackoutPeriod(p.id);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    reason: p.reason,
    startsAt: p.startsAt,
    endsAt: p.endsAt,
    isActive: !!p.isActive,
  });

  return (
    <Table.Row className="bg-white">
      <Table.Cell>
        {isEditing ? (
          <TextInput
            value={form.reason}
            onChange={(e) => setForm((s) => ({ ...s, reason: e.target.value }))}
          />
        ) : (
          <span className="font-medium">{p.reason}</span>
        )}
      </Table.Cell>
      <Table.Cell>
        {isEditing ? (
          <TextInput
            type="datetime-local"
            value={toLocalInput(form.startsAt)}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                startsAt: fromLocalInput(e.target.value),
              }))
            }
          />
        ) : (
          <span>{formatDT(p.startsAt)}</span>
        )}
      </Table.Cell>
      <Table.Cell>
        {isEditing ? (
          <TextInput
            type="datetime-local"
            value={toLocalInput(form.endsAt)}
            onChange={(e) =>
              setForm((s) => ({ ...s, endsAt: fromLocalInput(e.target.value) }))
            }
          />
        ) : (
          <span>{formatDT(p.endsAt)}</span>
        )}
      </Table.Cell>
      <Table.Cell>
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            p.isActive ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {p.isActive ? "يوقف الطلبات" : "غير مفعل"}
        </span>
      </Table.Cell>
      <Table.Cell>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                size="xs"
                color="dark"
                onClick={() =>
                  update.mutate(form, { onSuccess: () => setIsEditing(false) })
                }
                isProcessing={update.isPending}
              >
                حفظ
              </Button>
              <Button
                size="xs"
                color="light"
                onClick={() => setIsEditing(false)}
              >
                إلغاء
              </Button>
            </>
          ) : (
            <Button size="xs" color="light" onClick={() => setIsEditing(true)}>
              تعديل
            </Button>
          )}
          <Button
            size="xs"
            color="failure"
            onClick={() => del.mutate()}
            disabled={del.isPending}
          >
            حذف
          </Button>
        </div>
      </Table.Cell>
    </Table.Row>
  );
}

function toLocalInput(v: string) {
  if (!v) return "";
  // Expecting "YYYY-MM-DD HH:mm:ss" => convert to "YYYY-MM-DDTHH:mm"
  return v.replace(" ", "T").slice(0, 16);
}
function fromLocalInput(v: string) {
  if (!v) return "";
  return v.replace("T", " ") + ":00";
}
function formatDT(v?: string) {
  if (!v) return "-";
  const [d, t] = v.split(" ");
  return `${d} ${t?.slice(0, 5)}`;
}
