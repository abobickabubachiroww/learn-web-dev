
import { useState } from "react";
import "./index.css";

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

const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const MONTHS_NOMINATIVE = [
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

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameDate(first, second) {
  return toDateKey(first) === toDateKey(second);
}

function formatFullDate(date) {
  if (!date) return "Дата не выбрана";

  const weekday = date.toLocaleDateString("ru-RU", {
    weekday: "long",
  });

  const capitalizedWeekday =
    weekday.charAt(0).toUpperCase() + weekday.slice(1);

  return `${capitalizedWeekday}, ${date.getDate()} ${
    MONTHS[date.getMonth()]
  } ${date.getFullYear()} г.`;
}

function getCalendarDays(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();

  const totalCells = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;
  const days = [];

  for (let index = 0; index < totalCells; index++) {
    const dayNumber = index - mondayOffset + 1;

    if (dayNumber < 1) {
      days.push({
        date: new Date(year, month - 1, daysInPreviousMonth + dayNumber),
        inCurrentMonth: false,
      });
    } else if (dayNumber > daysInMonth) {
      days.push({
        date: new Date(year, month + 1, dayNumber - daysInMonth),
        inCurrentMonth: false,
      });
    } else {
      days.push({
        date: new Date(year, month, dayNumber),
        inCurrentMonth: true,
      });
    }
  }

  return days;
}

function getFirstAvailableDate(year, month) {
  const today = startOfDay(new Date());
  const firstDayOfMonth = new Date(year, month, 1);
  const candidate = firstDayOfMonth < today ? today : firstDayOfMonth;

  if (candidate.getMonth() !== month || candidate.getFullYear() !== year) {
    return null;
  }

  return candidate;
}

// Демонстрационные занятые часы привязаны к конкретным датам.
// В реальном проекте эти данные следует получать от сервера.
function getBusySlots(date) {
  if (!date) return [];

  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDate(date, today)) {
    return ["11:00", "13:00"];
  }

  if (isSameDate(date, tomorrow)) {
    return ["12:00", "15:00"];
  }

  return [];
}

/* КОМПОНЕНТ КАЛЕНДАРЯ */

function Calendar({
  viewDate,
  selectedDate,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
}) {
  const calendarDays = getCalendarDays(viewDate);
  const today = startOfDay(new Date());

  const currentMonthStart = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1
  );

  const currentMonthLabel = `${
    MONTHS_NOMINATIVE[viewDate.getMonth()]
  } ${viewDate.getFullYear()}`;

  const previousMonthDisabled =
    currentMonthStart <= new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <section className="cal-card">
      <div className="cal-head">
        <h3>{currentMonthLabel}</h3>

        <div className="cal-nav">
          <button
            type="button"
            onClick={onPreviousMonth}
            disabled={previousMonthDisabled}
            aria-label="Предыдущий месяц"
          >
            &#8249;
          </button>

          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Следующий месяц"
          >
            &#8250;
          </button>
        </div>
      </div>

      <div className="cal-dow-row">
        {WEEKDAYS.map((weekday) => (
          <div className="cal-dow" key={weekday}>
            {weekday}
          </div>
        ))}
      </div>

      <div className="cal-grid">
        {calendarDays.map(({ date, inCurrentMonth }) => {
          const isPast = startOfDay(date) < today;
          const isSelected = selectedDate && isSameDate(date, selectedDate);
          const isToday = isSameDate(date, today);

          return (
            <button
              type="button"
              key={toDateKey(date)}
              className={[
                "cal-day",
                !inCurrentMonth ? "muted" : "",
                isSelected ? "selected" : "",
                isToday ? "today" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={!inCurrentMonth || isPast}
              onClick={() => onDateSelect(date)}
              aria-pressed={Boolean(isSelected)}
              aria-label={formatFullDate(date)}
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
  );
}

/* КОМПОНЕНТ ВЫБОРА ВРЕМЕНИ */

function TimeSlots({
  selectedDate,
  selectedTime,
  onTimeSelect,
  busySlots,
}) {
  return (
    <section className="time-card">
      <div>
        <h3>Доступное время</h3>
        <p className="time-description">
          {selectedDate
            ? `Выберите удобное время на ${selectedDate.getDate()} ${
                MONTHS[selectedDate.getMonth()]
              }`
            : "Сначала выберите дату"}
        </p>
      </div>

      <div className="time-grid">
        {TIME_SLOTS.map((time) => {
          const isBusy = busySlots.includes(time);
          const isSelected = selectedTime === time;

          return (
            <button
              type="button"
              key={time}
              className={[
                "time-slot",
                isSelected ? "selected" : "",
                isBusy ? "busy" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={!selectedDate || isBusy}
              onClick={() => onTimeSelect(time)}
              aria-pressed={isSelected}
            >
              {time}
              {isBusy && <span>Занято</span>}
            </button>
          );
        })}
      </div>

      <p className="time-hint">
        Серым цветом отмечено время, которое уже занято.
      </p>
    </section>
  );
}

/* КОМПОНЕНТ НИЖНЕЙ ПАНЕЛИ */

function BookingSummary({ selectedDate, selectedTime, onContinue }) {
  const canContinue = Boolean(selectedDate && selectedTime);

  return (
    <section className="bottom">
      <div className="summary">
        <p className="summary-label">Ваша запись</p>

        <p className="summary-text">
          {canContinue ? (
            <>
              {formatFullDate(selectedDate)}
              <br />
              Время: {selectedTime}
            </>
          ) : selectedDate ? (
            <>
              {formatFullDate(selectedDate)}
              <br />
              Выберите время посещения
            </>
          ) : (
            "Выберите дату и время для записи."
          )}
        </p>
      </div>

      <button
        type="button"
        className="btn-continue"
        disabled={!canContinue}
        onClick={onContinue}
      >
        Продолжить <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}

/* ОСНОВНОЕ ПРИЛОЖЕНИЕ */

export default function App() {
  const today = startOfDay(new Date());

  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState(null);

  function chooseDate(date) {
    if (startOfDay(date) < startOfDay(new Date())) return;

    setSelectedDate(date);
    setSelectedTime(null);
  }

  function previousMonth() {
    const currentMonth = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      1
    );

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    if (currentMonth <= thisMonth) return;

    const newViewDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() - 1,
      1
    );

    setViewDate(newViewDate);
    setSelectedDate(
      getFirstAvailableDate(
        newViewDate.getFullYear(),
        newViewDate.getMonth()
      )
    );
    setSelectedTime(null);
  }

  function nextMonth() {
    const newViewDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + 1,
      1
    );

    setViewDate(newViewDate);
    setSelectedDate(
      getFirstAvailableDate(
        newViewDate.getFullYear(),
        newViewDate.getMonth()
      )
    );
    setSelectedTime(null);
  }

  function handleContinue() {
    if (!selectedDate || !selectedTime) return;

    const booking = {
      date: toDateKey(selectedDate),
      time: selectedTime,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("barberBroBooking", JSON.stringify(booking));
      alert(
        `Вы выбрали запись на ${formatFullDate(selectedDate)}, ${selectedTime}.`
      );
    } catch (error) {
      console.error("Не удалось сохранить запись:", error);
      alert("Не удалось сохранить запись. Попробуйте ещё раз.");
    }
  }

  const busySlots = getBusySlots(selectedDate);

  return (
    <div className="page">
      <header className="header">
        <a href="#" className="brand" aria-label="БарберБРО — главная">
          <div className="logo-mark">Б</div>
          <div className="brand-text">
            <h1>БарберБРО</h1>
            <p>Мужская парикмахерская</p>
          </div>
        </a>

        <nav className="nav" aria-label="Главная навигация">
          <a href="#services">Услуги</a>
          <a href="#about">О нас</a>
          <a href="#contacts">Контакты</a>
          <a href="#booking" className="btn-book">
            Записаться
          </a>
        </nav>
      </header>

      <div className="stepper" aria-label="Этапы записи">
        <div className="step-group">
          <div className="step">
            <span className="step-num done">✓</span>
            <span className="step-label">Услуга</span>
          </div>
          <span className="step-line" />
        </div>

        <div className="step-group">
          <div className="step">
            <span className="step-num active">2</span>
            <span className="step-label active">Дата и время</span>
          </div>
          <span className="step-line" />
        </div>

        <div className="step-group">
          <div className="step">
            <span className="step-num">3</span>
            <span className="step-label muted">Подтверждение</span>
          </div>
        </div>
      </div>

      <main className="main" id="booking">
        <div className="page-head">
          <a href="#" className="btn-back" onClick={(event) => event.preventDefault()}>
            <span aria-hidden="true">←</span> Назад
          </a>

          <span className="step-indicator">Шаг 2 из 3</span>

          <h2>Выберите дату и время</h2>
        </div>

        <div className="layout">
          <Calendar
            viewDate={viewDate}
            selectedDate={selectedDate}
            onDateSelect={chooseDate}
            onPreviousMonth={previousMonth}
            onNextMonth={nextMonth}
          />

          <TimeSlots
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onTimeSelect={setSelectedTime}
            busySlots={busySlots}
          />
        </div>

        <BookingSummary
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onContinue={handleContinue}
        />
      </main>

      <footer className="footer" id="contacts">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <a href="#" className="brand">
              <div className="logo-mark">Б</div>
              <div className="brand-text">
                <h1>БарберБРО</h1>
                <p>Мужская парикмахерская</p>
              </div>
            </a>
            <p className="footer-tag">
              Стиль начинается с деталей.
              <br />
              Ждём вас в гости!
            </p>
          </div>

          <div className="footer-col" id="services">
            <h4>Навигация</h4>
            <a href="#services" className="footer-link">
              Услуги
            </a>
            <a href="#about" className="footer-link">
              О нас
            </a>
            <a href="#booking" className="footer-link">
              Онлайн-запись
            </a>
          </div>

          <div className="footer-col">
            <h4>Контакты</h4>
            <p className="footer-link phone">+7 (900) 000-00-00</p>
            <p>Ежедневно: 10:00–20:00</p>
            <p>Адрес уточняйте у администратора</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} БарберБРО. Все права защищены.</p>
          <a href="#contacts">Контактная информация</a>
        </div>
      </footer>
    </div>
  );
}
