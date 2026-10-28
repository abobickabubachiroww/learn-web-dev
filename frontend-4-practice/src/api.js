
export async function fetchToday() {
  const response = await fetch("/api/booking/today");

  if (!response.ok) {
    throw new Error(`Ошибка сервера: ${response.status}`);
  }

  return response.json();
}

export async function fetchSlots(date) {
  const params = new URLSearchParams({
    day: String(date.day),
    month: String(date.month),
    year: String(date.year),
  });

  const response = await fetch(`/api/slots?${params}`);

  if (!response.ok) {
    throw new Error(`Ошибка сервера: ${response.status}`);
  }

  return response.json();
}
