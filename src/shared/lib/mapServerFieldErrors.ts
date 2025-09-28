// يحاول قراءة بنية أخطاء شائعة من الـ backend وإرجاع كائن { fieldName: message }
// يفترض أحد الأشكال:
// 1. { errors: { name: ["msg"], description: ["msg"] } }
// 2. { message: "..", errors: { ... } }
// 3. Laravel style: { errors: { field: ["msg1", "msg2"] } }
// 4. { field: "name", message: "error" }

export interface ServerErrorShape {
  [k: string]: any;
}

export function mapServerFieldErrors(
  resBody: ServerErrorShape | undefined | null
): Record<string, string> {
  if (!resBody) return {};
  const out: Record<string, string> = {};

  // Direct errors object
  if (resBody.errors && typeof resBody.errors === "object") {
    Object.entries(resBody.errors).forEach(([field, val]) => {
      if (!val) return;
      if (Array.isArray(val)) out[field] = String(val[0]);
      else if (typeof val === "string") out[field] = val;
    });
  }

  // Single field message
  if (resBody.field && resBody.message && !out[resBody.field]) {
    out[resBody.field] = resBody.message;
  }

  return out;
}
