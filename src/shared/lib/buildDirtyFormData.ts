export function buildDirtyFormData<T extends Record<string, any>>(
  values: T,
  dirty: Record<string, boolean>,
  fileFields: string[] = []
): FormData {
  const fd = new FormData();
  Object.keys(dirty).forEach((key) => {
    if (!dirty[key]) return;
    const val = values[key];
    if (val === undefined || val === null) return;
    if (fileFields.includes(key)) {
      // expect FileList or File
      if (val instanceof File) fd.append(key, val);
      else if (val instanceof FileList && val.length > 0)
        fd.append(key, val[0]);
    } else {
      fd.append(key, String(val));
    }
  });
  return fd;
}
