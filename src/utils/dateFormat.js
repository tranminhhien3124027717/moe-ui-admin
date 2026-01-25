export const formatDate = (iso) => {
  const d = new Date(iso);
  
  // Convert UTC to UTC+7
  const utcTime = d.getTime();
  const utcOffset = d.getTimezoneOffset() * 60000;
  const utc7Offset = 7 * 60 * 60000;
  const localTime = new Date(utcTime + utcOffset + utc7Offset);
  
  const day = String(localTime.getDate()).padStart(2, "0");
  const month = String(localTime.getMonth() + 1).padStart(2, "0");
  const year = localTime.getFullYear();

  return `${day}/${month}/${year}`;
};