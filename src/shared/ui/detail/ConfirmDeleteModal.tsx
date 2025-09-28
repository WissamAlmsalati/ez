"use client";
import { Modal, Button } from "flowbite-react";
import { toast } from "sonner";
import React from "react";

interface ConfirmDeleteModalProps {
  open: boolean;
  title?: string;
  description?: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<any> | any;
}

export default function ConfirmDeleteModal({
  open,
  title = "تأكيد الحذف",
  description = "هل أنت متأكد من عملية الحذف؟",
  isLoading,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <Modal show={open} onClose={onClose} size="md" popup>
      <Modal.Header />
      <Modal.Body>
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
          <div className="flex gap-3 justify-center pt-2">
            <Button color="gray" onClick={onClose}>
              إلغاء
            </Button>
            <Button
              color="failure"
              isProcessing={isLoading}
              onClick={async () => {
                try {
                  await onConfirm();
                  onClose();
                } catch (e: any) {
                  toast.error(e?.body?.message || e.message || "فشل الحذف");
                }
              }}
            >
              حذف
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
