type DateInput = string | number | Date;

// this function will convert the createdAt to this format: "May 2023"
export function formatMemberSince(dateInput: DateInput): string {
  const date = new Date(dateInput);
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  return `${month} ${year}`;
}

// this function will convert the createdAt to this format: "May 15, 2023"
export function formatPublishDate(dateInput: DateInput): string {
  const date = new Date(dateInput);
  const month = date.toLocaleString("default", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}
