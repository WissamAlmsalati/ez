"use client";
import React from "react";
import { Modal, TextInput, Table, Tooltip } from "flowbite-react";
import {
  useUnitsQuery,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
} from "@/entities/unit/api";
import type { Unit } from "@/entities/unit/types";
import { toast } from "sonner";
import {
  IconPencil,
  IconTrash,
  IconCheck,
  IconX,
  IconPlus,
} from "@tabler/icons-react";
import ConfirmDeleteModal from "@/shared/ui/detail/ConfirmDeleteModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

type RowValues = { name: string; description?: string | null };

const UnitsModal: React.FC<Props> = ({ open, onClose }) => {
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [editingId, setEditingId] = React.useState<number | string | null>(
    null
  );

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const list = useUnitsQuery({
    page: 1,
    per_page: 500,
    search: debounced || undefined,
  });
  const createMut = useCreateUnit();
  const [confirmDelete, setConfirmDelete] = React.useState<{
    name: string;
    doDelete: () => Promise<void>;
  } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  function startEdit(id: number | string | null) {
    setEditingId(id);
  }
  function clearEdit() {
    setEditingId(null);
  }

  return (
    <Modal show={open} size="xl" onClose={onClose} popup>
      <Modal.Header className="p-4">
        <span className="text-lg font-semibold rtl:text-right">
          إدارة الوحدات
        </span>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TextInput
              placeholder="ابحث عن وحدة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {list.isError && (
            <div className="text-sm text-red-600">
              تعذر جلب الوحدات. حاول لاحقًا.
            </div>
          )}

          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <Table className="white-header centered-table">
              <Table.Head className="border-b ">
                <Table.HeadCell>الاسم</Table.HeadCell>
                <Table.HeadCell>الوصف</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {/* Inline new row */}
                {list.isLoading ? null : (
                  <InlineNewRow
                    onCreate={async (values) => {
                      try {
                        await createMut.mutateAsync({
                          name: values.name,
                          description: values.description,
                          is_active: true,
                        });
                        toast.success("تمت إضافة الوحدة");
                      } catch (e: any) {
                        toast.error(e?.body?.message || "فشل الإضافة");
                      }
                    }}
                  />
                )}

                {/* Loading state */}
                {list.isLoading ? (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonRow key={`sk-${i}`} />
                    ))}
                  </>
                ) : list.data?.data?.length ? (
                  list.data.data.map((u) => (
                    <UnitRow
                      key={u.id}
                      unit={u}
                      editing={editingId === u.id}
                      onEdit={() => startEdit(u.id)}
                      onCancel={clearEdit}
                      onSaved={clearEdit}
                      onRequestDelete={(doDelete, name) =>
                        setConfirmDelete({ doDelete, name })
                      }
                    />
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell
                      colSpan={3}
                      className="text-center text-sm py-6"
                    >
                      لا توجد وحدات
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </div>

        {/* Confirm Delete Modal */}
        <ConfirmDeleteModal
          open={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          title="تأكيد الحذف"
          description={
            confirmDelete
              ? `هل أنت متأكد من حذف الوحدة: "${confirmDelete.name}"؟`
              : ""
          }
          isLoading={deleting}
          onConfirm={async () => {
            if (!confirmDelete) return;
            setDeleting(true);
            try {
              await confirmDelete.doDelete();
              toast.success("تم الحذف");
              setConfirmDelete(null);
            } catch (e: any) {
              toast.error(e?.body?.message || "فشل الحذف");
            } finally {
              setDeleting(false);
            }
          }}
        />
      </Modal.Body>
    </Modal>
  );
};

const SkeletonRow: React.FC = () => (
  <Table.Row className="bg-white">
    <Table.Cell>
      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
    </Table.Cell>
    <Table.Cell>
      <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
    </Table.Cell>
    <Table.Cell>
      <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
    </Table.Cell>
  </Table.Row>
);

const InlineNewRow: React.FC<{
  onCreate: (values: RowValues) => Promise<void>;
}> = ({ onCreate }) => {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const canSave = name.trim().length > 0 && !pending;

  async function save() {
    if (!canSave) return;
    setPending(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName("");
      setDescription("");
    } finally {
      setPending(false);
    }
  }

  return (
    <Table.Row className="">
      <Table.Cell>
        <TextInput
          sizing="sm"
          placeholder="اسم الوحدة"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Table.Cell>
      <Table.Cell>
        <TextInput
          sizing="sm"
          placeholder="الوصف (اختياري)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Table.Cell>
      <Table.Cell>
        <div className="flex items-center gap-2 rtl:space-x-reverse">
          <Tooltip content="إضافة" style="light">
            <button
              type="button"
              onClick={save}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-green-200 hover:bg-green-50 text-green-600 disabled:opacity-50"
              disabled={!canSave}
            >
              <IconPlus size={16} />
            </button>
          </Tooltip>
        </div>
      </Table.Cell>
    </Table.Row>
  );
};

const UnitRow: React.FC<{
  unit: Unit;
  editing?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: () => void;
  onRequestDelete: (doDelete: () => Promise<void>, name: string) => void;
}> = ({ unit, editing, onEdit, onCancel, onSaved, onRequestDelete }) => {
  const deleteMut = useDeleteUnit(unit.id);
  const updateMut = useUpdateUnit(unit.id);
  const [name, setName] = React.useState(unit.name);
  const [description, setDescription] = React.useState(unit.description ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (editing) {
      setName(unit.name);
      setDescription(unit.description ?? "");
    }
  }, [editing, unit.name, unit.description]);

  function onDeleteClick() {
    const doDelete = async () => {
      await deleteMut.mutateAsync();
    };
    onRequestDelete(doDelete, unit.name);
  }

  const trimmedName = name.trim();
  const trimmedDesc = description.trim();
  const origName = (unit.name ?? "").trim();
  const origDesc = (unit.description ?? "").trim();
  const dirty = trimmedName !== origName || trimmedDesc !== origDesc;
  const canSave = trimmedName.length > 0 && dirty && !saving;

  async function onSave() {
    if (!editing || !canSave) return;
    setSaving(true);
    try {
      await updateMut.mutateAsync({
        name: trimmedName,
        description: trimmedDesc || undefined,
      });
      toast.success("تم الحفظ");
      onSaved();
    } catch (e: any) {
      toast.error(e?.body?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Table.Row className="bg-white">
      <Table.Cell>
        {editing ? (
          <TextInput
            sizing="sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          unit.name
        )}
      </Table.Cell>
      <Table.Cell>
        {editing ? (
          <TextInput
            sizing="sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        ) : (
          unit.description
        )}
      </Table.Cell>
      <Table.Cell>
        <div className="flex items-center gap-2 rtl:space-x-reverse">
          {editing ? (
            <>
              <Tooltip content="حفظ" style="light">
                <button
                  type="button"
                  onClick={onSave}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-green-200 hover:bg-green-50 text-green-600 disabled:opacity-50"
                  disabled={!canSave}
                >
                  <IconCheck size={16} />
                </button>
              </Tooltip>
              <Tooltip content="إلغاء" style="light">
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                  <IconX size={16} />
                </button>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip content="تعديل" style="light">
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                  <IconPencil size={16} />
                </button>
              </Tooltip>
              <Tooltip content="حذف" style="light">
                <button
                  type="button"
                  onClick={onDeleteClick}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 hover:bg-red-50 text-red-600"
                >
                  <IconTrash size={16} />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  );
};

export default UnitsModal;
