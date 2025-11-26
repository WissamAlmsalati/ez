"use client";
import {
  Modal,
  Button,
  Label,
  TextInput,
  Checkbox,
  Select,
  Spinner,
} from "flowbite-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserValues } from "./schema";
import { useCreateUser } from "@/entities/user/api";
import { toast } from "sonner";
import { useState } from "react";
import RemoteSelect from "@/shared/ui/remote/RemoteSelect";

export default function CreateUserModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createMutation = useCreateUser();
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema) as any,
    defaultValues: { is_active: true, role: "customer" },
  });

  const role = watch("role");

  const onSubmit = handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      const payload: any = {
        name: values.name,
        email: values.email || undefined,
        password: values.password,
        phone: values.phone || undefined,
        role: values.role,
        category_id:
          values.role === "employee" ? values.category_id : undefined,
        is_active: values.is_active,
      };
      await createMutation.mutateAsync(payload);
      toast.success("تم إضافة المستخدم بنجاح");
      reset();
      setSelectedCategory(null);
      onClose();
    } catch (e: any) {
      toast.error(e?.body?.message || "حدث خطأ أثناء الإضافة");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Modal show={open} size="md" onClose={onClose} popup>
      <Modal.Header className="p-4">
        <span className="text-lg font-semibold rtl:text-right">
          إضافة مستخدم
        </span>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label value="الاسم" />
            <TextInput
              {...register("name")}
              color={errors.name ? "failure" : undefined}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name.message as any}
              </p>
            )}
          </div>
          <div>
            <Label value="البريد الإلكتروني" />
            <TextInput
              type="email"
              {...register("email")}
              color={errors.email ? "failure" : undefined}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message as any}
              </p>
            )}
          </div>
          <div>
            <Label value="كلمة المرور" />
            <TextInput
              type="password"
              {...register("password")}
              color={errors.password ? "failure" : undefined}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message as any}
              </p>
            )}
          </div>
          <div>
            <Label value="الهاتف" />
            <TextInput
              {...register("phone")}
              placeholder="09XXXXXXXX"
              maxLength={10}
              inputMode="numeric"
              // pattern="^09\\d{8}$"
              color={errors.phone ? "failure" : undefined}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message as any}
              </p>
            )}
          </div>
          <div>
            <Label value="نوع الحساب" />
            <Select {...register("role")}>
              <option value="customer">زبون</option>
              <option value="employee">موظف</option>
            </Select>
          </div>
          {role === "employee" && (
            <div>
              <Label value="القسم" />
              <RemoteSelect
                path="/categories"
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(val);
                  if (val) {
                    setValue("category_id", (val as any).id as number, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  } else {
                    setValue("category_id", undefined as any, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }}
                getOptionValue={(d: any) => d.id}
                getOptionLabel={(d: any) => d.name}
                placeholder="اختر القسم"
                pageSize={100}
              />
              {errors.category_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category_id.message as any}
                </p>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_active"
              {...register("is_active")}
              defaultChecked
            />
            <Label htmlFor="is_active">نشط</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button color="gray" onClick={onClose} type="button">
              إلغاء
            </Button>
            <Button type="submit" disabled={submitting} color={"primary"}>
              {submitting ? <Spinner size="sm" /> : "تأكيد"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
