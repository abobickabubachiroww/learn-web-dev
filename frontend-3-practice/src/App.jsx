
import { useState } from "react";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const TIME_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const BUSY_SLOTS = ["11:00", "13:00"];

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const today = new Date();
today.setHours(0, 0, 0, 0);

function sameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(date) {
  if (!date) return "Не выбрана";

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();

  const days = [];

  for (let i = 0; i < 42; i += 1) {
    let date;
    let currentMonth = true;

    if (i < mondayOffset) {
      date = new Date(
        year,
        month - 1,
        previousMonthDays - mondayOffset + i + 1
      );
      currentMonth = false;
    } else if (i >= mondayOffset + daysInMonth) {
      date = new Date(year, month + 1, i - mondayOffset - daysInMonth + 1);
      currentMonth = false;
    } else {
      date = new Date(year, month, i - mondayOffset + 1);
    }

    date.setHours(0, 0, 0, 0);

    days.push({
      date,
      currentMonth,
      disabled: date < today,
    });
  }

  return days;
}

function App() {
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(() => new Date(today));
  const [selectedTime, setSelectedTime] = useState(null);

  const calendarDays = getCalendarDays(
    viewDate.getFullYear(),
    viewDate.getMonth()
  );

  const previousMonth = () => {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
    );
  };

  const previousMonthDisabled =
    viewDate.getFullYear() === today.getFullYear() &&
    viewDate.getMonth() === today.getMonth();

  const chooseDate = (date) => {
    if (date < today) return;

    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return;

    const booking = {
      master: "Марина, стилист-колорист",
      service: "Комплекс стрижка + борода",
      date: formatDate(selectedDate),
      time: selectedTime,
    };

    localStorage.setItem("barberBooking", JSON.stringify(booking));

    alert(
      `Вы выбрали запись:\n${booking.date}, ${booking.time}\n\nДанные сохранены в браузере.`
    );
  };

  return (
    <div className="page">
      <header className="header">
        <a className="brand" href="#" aria-label="БарберБРО — главная">
          <div className="logo-mark">Б</div>

          <div className="brand-text">
            <h1>БарберБРО</h1>
            <p>Качественная стрижка и уход</p>
          </div>
        </a>

        <nav className="nav">
          <a href="#services">Услуги</a>
          <a href="#masters">Мастера</a>
          <a href="#reviews">Отзывы</a>
          <a href="#contacts">Контакты</a>
          <button
            className="btn-book"
            onClick={() =>
              document
                .querySelector(".main")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Записаться
          </button>
        </nav>
      </header>

      <div className="stepper" aria-label="Этапы записи">
        {[
          "Мастер",
          "Услуга",
          "Дата и время",
          "Контакты",
          "Подтверждение",
        ].map((label, index) => {
          const number = index + 1;
          const completed = number < 3;
          const active = number === 3;

          return (
            <div className="step-group" key={label}>
              <div className="step">
                <div
                  className={`step-num${completed ? " done" : ""}${
                    active ? " active" : ""
                  }`}
                >
                  {number}
                </div>

                <div
                  className={`step-label${active ? " active" : ""}${
                    number > 3 ? " muted" : ""
                  }`}
                >
                  {label}
                </div>
              </div>

              {number < 5 && <div className="step-line" />}
            </div>
          );
        })}
      </div>

      <main className="main">
        <div className="page-head">
          <button
            className="btn-back"
            type="button"
            onClick={() => window.history.back()}
          >
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
            Назад
          </button>

          <span className="step-indicator">Шаг 3 из 5</span>
          <h2>Выберите дату и время</h2>
        </div>

        <div className="layout">
          <section className="cal-card">
            <div className="cal-head">
              <h3>
                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              </h3>

              <div className="cal-nav">
                <button
                  type="button"
                  aria-label="Предыдущий месяц"
                  disabled={previousMonthDisabled}
                  onClick={previousMonth}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <button
                  type="button"
                  aria-label="Следующий месяц"
                  onClick={nextMonth}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="cal-dow-row">
              {WEEKDAYS.map((day) => (
                <div className="cal-dow" key={day}>
                  {day}
                </div>
              ))}
            </div>

            <div className="cal-grid">
              {calendarDays.map(({ date, currentMonth, disabled }) => {
                const selected = sameDate(date, selectedDate);
                const isToday = sameDate(date, today);

                const classNames = [
                  "cal-day",
                  !currentMonth ? "muted" : "",
                  selected ? "selected" : "",
                  isToday ? "today" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    type="button"
                    key={date.toISOString()}
                    className={classNames}
                    disabled={disabled}
                    aria-pressed={selected}
                    aria-label={formatDate(date)}
                    onClick={() => chooseDate(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="calendar-legend">
              <span className="legend-dot" />
              <span>Выбранная дата</span>
            </div>
          </section>

          <section className="time-card">
            <div>
              <h3>Доступное время</h3>
              <p className="time-description">
                {selectedDate
                  ? `Выберите время на ${formatDate(selectedDate)}`
                  : "Сначала выберите дату"}
              </p>
            </div>

            <div className="time-grid">
              {TIME_SLOTS.map((time) => {
                const busy = BUSY_SLOTS.includes(time);
                const selected = selectedTime === time;

                return (
                  <button
                    type="button"
                    key={time}
                    className={`time-slot${busy ? " busy" : ""}${
                      selected ? " selected" : ""
                    }`}
                    disabled={busy || !selectedDate}
                    aria-pressed={selected}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                    {busy && <span>Занято</span>}
                  </button>
                );
              })}
            </div>

            <p className="time-hint">
              Серым цветом отмечено занятое время. Выберите любой свободный
              интервал, чтобы продолжить запись.
            </p>
          </section>
        </div>

        <div className="bottom">
          <div className="summary">
            <div className="summary-label">Текущий выбор</div>

            <div className="summary-text">
              <p>Марина, стилист-колорист</p>
              <p>Комплекс стрижка + борода</p>
              <p>
                {formatDate(selectedDate)}
                {selectedTime ? `, ${selectedTime}` : ", время не выбрано"}
              </p>
            </div>
          </div>

          <button
            className="btn-continue"
            type="button"
            disabled={!selectedDate || !selectedTime}
            onClick={handleContinue}
          >
            Продолжить
            <span aria-hidden="true"> →</span>
          </button>
        </div>
      </main>

      <footer className="footer" id="contacts">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <a className="brand" href="#">
              <div className="logo-mark">Б</div>

              <div className="brand-text">
                <h1>БарберБРО</h1>
                <p>Качественная стрижка и уход</p>
              </div>
            </a>

            <p className="footer-tag">Красим, бреем и стрижём</p>
          </div>

          <div className="footer-col">
            <h4>Контакты</h4>

            <a href="#contacts" className="footer-link">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              ул. Садовая, 15, Москва
            </a>

            <a href="tel:+74951234567" className="footer-link phone">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
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
          <a href="#privacy">Политика конфиденциальности</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
