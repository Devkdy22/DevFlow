const pad2 = (num: number) => String(num).padStart(2, "0");

export const toLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const toLocalDateTimeInputValue = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${toLocalDateKey(date)}T${pad2(date.getHours())}:${pad2(
    date.getMinutes()
  )}`;
};

export const toIsoStringOrUndefined = (value: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};
