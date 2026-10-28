
import { useEffect, useRef, useState } from "react";
import { fetchToday, fetchSlots } from "./api";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель",
  "Май", "Июнь", "Июль", "Август",
  "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function dateKey(date) {
  return `${date.year}-${date.month}-${date.day}`;
}

function sameDate(a, b) {
  return Boolean(
    a && b &&
    a.day === b.day &&
    a.month === b.month &&
    a.year === b.year
  );
}

function compareDates(a, b) {
  return new Date(a.year, a.month, a.day).getTime() -
    new Date(b.year, b.month, b.day).getTime();
}

function formatDate(date) {
  if (!date) return "";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date.year, date.month, date.day));
}

function makeCalendar(year, month) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const count = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(year, month, index - firstWeekday + 1);

    return {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      currentMonth: date.getMonth() === month,
    };
  });
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Неизвестная ошибка.";
}

function CalendarIcon({ direction }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#333"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#A0A5A5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#A0A5A5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function Brand() {
  return (
    <div className="brand">
      <div className="logo-mark">Б</div>
      <div className="brand-text">
        <h1>БарберБРО</h1>
        <p>Качественная стрижка и уход</p>
      </div>
    </div>
  );
}

export default function App() {
  const [today, setToday] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [visibleMonth, setVisibleMonth] = useState(null);

  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");

  const [todayLoading, setTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const [reloadSlots, setReloadSlots] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function loadToday() {
      setTodayLoading(true);
      setTodayError("");

      try {
        const result = await fetchToday();

        const serverDate = {
          day: Number(result.day),
          month: Number(result.month),
          year: Number(result.year),
        };

        const maxDay = new Date(
          serverDate.year,
          serverDate.month + 1,
          0
        ).getDate();

        if (
          !Number.isInteger(serverDate.day) ||
          !Number.isInteger(serverDate.month) ||
          !Number.isInteger(serverDate.year) ||
          serverDate.month < 0 ||
          serverDate.month > 11 ||
          serverDate.day < 1 ||
          serverDate.day > maxDay
        ) {
          throw new Error("Сервер вернул некорректную дату.");
        }

        if (cancelled) return;

        setToday(serverDate);
        setSelectedDate(serverDate);
        setVisibleMonth({
          year: serverDate.year,
          month: serverDate.month,
        });
      } catch (error) {
        if (!cancelled) {
          setTodayError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) setTodayLoading(false);
      }
    }

    loadToday();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const currentRequest = ++requestId.current;
    let cancelled = false;

    async function loadSlots() {
      setSlotsLoading(true);
      setSlotsError("");
      setSlots([]);
      setSelectedTime("");

      try {
        const result = await fetchSlots(selectedDate);

        if (cancelled || currentRequest !== requestId.current) return;

        if (!result || !Array.isArray(result.slots)) {
          throw new Error("Сервер вернул некорректный список слотов.");
        }

        setSlots(result.slots);
      } catch (error) {
        if (!cancelled && currentRequest === requestId.current) {
          setSlotsError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled && currentRequest === requestId.current) {
          setSlotsLoading(false);
        }
      }
    }

    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [selectedDate, reloadSlots]);

  function selectDate(date) {
    if (!date.currentMonth || compareDates(date, today) < 0) return;

    setSelectedDate({
      day: date.day,
      month: date.month,
      year: date.year,
    });
  }

  function changeMonth(direction) {
    if (!visibleMonth || !today) return;

    const next = new Date(
      visibleMonth.year,
      visibleMonth.month + direction,
      1
    );

    const beforeToday =
      next.getFullYear() < today.year ||
      (next.getFullYear() === today.year &&
        next.getMonth() < today.month);

    if (beforeToday) return;

    setVisibleMonth({
      year: next.getFullYear(),
      month: next.getMonth(),
    });
  }

  function handleContinue() {
    if (!selectedDate || !selectedTime) return;

    const booking = {
      date: selectedDate,
      time: selectedTime,
    };

    try {
      localStorage.setItem("barberBooking", JSON.stringify(booking));
    } catch {
      // Браузер может запрещать localStorage.
    }

    alert(
      `Вы выбрали: ${formatDate(selectedDate)}, ${selectedTime}`
    );
  }

  const calendarDays = visibleMonth
    ? makeCalendar(visibleMonth.year, visibleMonth.month)
    : [];

  const previousMonthDisabled =
    !visibleMonth ||
    !today ||
    visibleMonth.year < today.year ||
    (visibleMonth.year === today.year &&
      visibleMonth.month <= today.month);

  const selectedSlot = slots.find(
    (slot) => slot.time === selectedTime && slot.available === true
  );

  if (todayLoading) {
    return (
      <div className="app">
        <header className="header">
          <Brand />
        </header>
        <main className="main">
          <div className="loading-state">Загрузка…</div>
        </main>
      </div>
    );
  }

  if (todayError) {
    return (
      <div className="app">
        <header className="header">
          <Brand />
        </header>
        <main className="main">
          <div className="error-state" role="alert">
            <p>Не удалось загрузить текущую дату: {todayError}</p>
            <button
              className="btn-continue"
              type="button"
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <Brand />

        <nav className="nav">
          <a href="#" className="active">Услуги</a>
          <a href="#">Мастера</a>
          <a href="#">Отзывы</a>
          <a href="#">Контакты</a>
          <button
            className="btn-book"
            type="button"
            onClick={() =>
              document.querySelector(".cal-card")?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
            }
          >
            Записаться
          </button>
        </nav>
      </header>

      <div className="stepper">
        <div className="step">
          <div className="step-num done">1</div>
          <div className="step-label">Мастер</div>
        </div>
        <div className="step-line" />

        <div className="step">
          <div className="step-num done">2</div>
          <div className="step-label">Услуга</div>
        </div>
        <div className="step-line" />

        <div className="step">
          <div className="step-num active">3</div>
          <div className="step-label active">Дата и время</div>
        </div>
        <div className="step-line" />

        <div className="step">
          <div className="step-num">4</div>
          <div className="step-label muted">Контакты</div>
        </div>
        <div className="step-line" />

        <div className="step">
          <div className="step-num">5</div>
          <div className="step-label muted">Подтверждение</div>
        </div>
      </div>

      <main className="main">
        <div className="page-head">
          <button
            className="btn-back"
            type="button"
            onClick={() => window.history.back()}
          >
            <BackIcon />
            Назад
          </button>
          <span className="step-indicator">Шаг 3 из 5</span>
          <h2>Выберите дату и время</h2>
        </div>

        <div className="layout">
          <section className="cal-card">
            <div className="cal-head">
              <h3>
                {MONTHS[visibleMonth.month]} {visibleMonth.year}
              </h3>

              <div className="cal-nav">
                <button
                  type="button"
                  aria-label="Предыдущий месяц"
                  disabled={previousMonthDisabled}
                  onClick={() => changeMonth(-1)}
                >
                  <CalendarIcon direction="left" />
                </button>
                <button
                  type="button"
                  aria-label="Следующий месяц"
                  onClick={() => changeMonth(1)}
                >
                  <CalendarIcon direction="right" />
                </button>
              </div>
            </div>

            <div className="cal-dow-row">
              {WEEKDAYS.map((day) => (
                <div className="cal-dow" key={day}>{day}</div>
              ))}
            </div>

            <div className="cal-grid">
              {calendarDays.map((date, index) => {
                const isPast = compareDates(date, today) < 0;
                const selected =
                  date.currentMonth && sameDate(date, selectedDate);
                const isMuted = !date.currentMonth || isPast;

                return (
                  <button
                    key={`${dateKey(date)}-${index}`}
                    type="button"
                    className={[
                      "cal-day",
                      isMuted ? "muted" : "",
                      selected ? "selected" : "",
                      sameDate(date, today) ? "today" : "",
                    ].filter(Boolean).join(" ")}
                    disabled={!date.currentMonth || isPast}
                    aria-pressed={selected}
                    onClick={() => selectDate(date)}
                  >
                    {date.day}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="time-card">
            <h3>Доступное время</h3>

            {slotsLoading ? (
              <div className="loading-state">Загрузка слотов…</div>
            ) : slotsError ? (
              <div className="error-state" role="alert">
                <p>Не удалось загрузить слоты: {slotsError}</p>
                <button
                  className="retry-button"
                  type="button"
                  onClick={() => setReloadSlots((value) => value + 1)}
                >
                  Попробовать снова
                </button>
              </div>
            ) : slots.length === 0 ? (
              <div className="empty-state">
                На эту дату нет доступного времени.
              </div>
            ) : (
              <div className="time-grid">
                {slots.map((slot) => {
                  const available = slot.available === true;
                  const selected = selectedTime === slot.time;

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      className={[
                        "time-slot",
                        !available ? "busy" : "",
                        selected ? "selected" : "",
                      ].filter(Boolean).join(" ")}
                      disabled={!available}
                      aria-pressed={selected}
                      onClick={() => setSelectedTime(slot.time)}
                    >
                      {slot.time}
                      {!available && <span>Занято</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="bottom">
          <div className="summary">
            <div className="summary-label">Текущий выбор</div>
            <div className="summary-text">
              Марина, стилист-колорист · Комплекс стрижка + борода
              {selectedDate && ` · ${formatDate(selectedDate)}`}
              {selectedSlot ? `, ${selectedSlot.time}` : ""}
            </div>
          </div>

          <button
            className="btn-continue"
            type="button"
            disabled={!selectedDate || !selectedSlot || slotsLoading}
            onClick={handleContinue}
          >
            Продолжить
          </button>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <Brand />
            <p className="footer-tag">Красим, бреем и стрижем</p>
          </div>

          <div className="footer-col">
            <h4>Контакты</h4>
            <a href="#" className="footer-link">
              <LocationIcon />
              ул. Садовая, 15, Москва
            </a>
            <a href="tel:+74951234567" className="footer-link phone">
              <PhoneIcon />
              +7 (495) 123-45-67
            </a>
          </div>

          <div className="footer-col">
            <h4>Режим работы</h4>
            <p>Пн–Пт: 9:00 – 21:00</p>
            <p>Сб–Вс: 10:00 – 19:00</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026. Все права защищены.</p>
          <a href="#">Политика конфиденциальности</a>
        </div>
      </footer>
    </div>
  );
}
