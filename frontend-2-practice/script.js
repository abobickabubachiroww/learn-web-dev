"use strict";

/* 1. ДАННЫЕ */

// Время, доступное для записи
const DEFAULT_SLOTS = [
	"10:00",
	"11:00",
	"12:00",
	"13:00",
	"14:00",
	"15:00",
	"16:00",
	"17:00",
];

// Занятые слоты для конкретных дат.
// Формат: "ГГГГ-ММ-ДД": ["10:00", "14:00"]
// Если дата отсутствует в объекте, все слоты свободны.
const BUSY_SLOTS_BY_DATE = {

	"2026-10-28": ["11:00", "13:00"],
};

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

const MONTHS_GENITIVE = [
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

const DAYS_OF_WEEK = [
	"Воскресенье",
	"Понедельник",
	"Вторник",
	"Среда",
	"Четверг",
	"Пятница",
	"Суббота",
];

const DAYS_OF_WEEK_SHORT = [
	"Пн",
	"Вт",
	"Ср",
	"Чт",
	"Пт",
	"Сб",
	"Вс",
];

// Информация о выбранной услуге и мастере
const BOOKING_DETAILS = {
	master: "Марина, стилист-колорист",
	service: "Комплекс стрижка + борода",
};


/*2. СОСТОЯНИЕ ПРИЛОЖЕНИЯ */

const today = startOfDay(new Date());

const BOOKING_STATE = {
	currentMonth: today.getMonth(),
	currentYear: today.getFullYear(),

	selectedDay: today.getDate(),
	selectedTime: null,

	today: today,
	slots: [...DEFAULT_SLOTS],
};


/* 3. ЧИСТЫЕ ФУНКЦИИ*/

// Убирает часы, минуты, секунды и миллисекунды
function startOfDay(date) {
	return new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate()
	);
}

// Сравнивает две даты без учёта времени
// Возвращает -1, если первая дата раньше второй,
// 0 — если даты одинаковые,
// 1 — если первая дата позже второй.
function compareDates(firstDate, secondDate) {
	const first = startOfDay(firstDate).getTime();
	const second = startOfDay(secondDate).getTime();

	if (first < second) return -1;
	if (first > second) return 1;

	return 0;
}

// Проверяет, можно ли выбрать дату
function isDateSelectable(date) {
	return compareDates(date, BOOKING_STATE.today) >= 0;
}

// Формирует ключ даты в формате ГГГГ-ММ-ДД
function dateKey(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

// Возвращает выбранную дату
function getSelectedDate() {
	return new Date(
		BOOKING_STATE.currentYear,
		BOOKING_STATE.currentMonth,
		BOOKING_STATE.selectedDay
	);
}

// Возвращает количество дней в месяце
function getDaysInMonth(year, month) {
	return new Date(year, month + 1, 0).getDate();
}

// Возвращает массив недель календаря.
// Неделя начинается с понедельника.
function buildCalendarGrid(year, month) {
	const firstDayOfMonth = new Date(year, month, 1);

	// JavaScript считает воскресенье первым днём недели.
	// Преобразуем нумерацию так, чтобы понедельник был первым.
	const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;

	const daysInMonth = getDaysInMonth(year, month);
	const daysInPreviousMonth = getDaysInMonth(
		year,
		month - 1
	);

	const cells = [];

	// Дни предыдущего месяца
	for (let i = firstWeekday - 1; i >= 0; i--) {
		cells.push({
			day: daysInPreviousMonth - i,
			monthOffset: -1,
		});
	}

	// Дни текущего месяца
	for (let day = 1; day <= daysInMonth; day++) {
		cells.push({
			day: day,
			monthOffset: 0,
		});
	}

	// Дни следующего месяца для заполнения последней недели
	let nextMonthDay = 1;

	while (cells.length % 7 !== 0) {
		cells.push({
			day: nextMonthDay,
			monthOffset: 1,
		});

		nextMonthDay++;
	}

	// Преобразуем плоский массив в массив недель
	const weeks = [];

	for (let i = 0; i < cells.length; i += 7) {
		weeks.push(cells.slice(i, i + 7));
	}

	return weeks;
}

// Возвращает дату ячейки календаря
function getDateFromCell(cell) {
	return new Date(
		BOOKING_STATE.currentYear,
		BOOKING_STATE.currentMonth + cell.monthOffset,
		cell.day
	);
}

// Получает занятые слоты для выбранной даты
function getBusySlotsForDate(date) {
	return BUSY_SLOTS_BY_DATE[dateKey(date)] || [];
}

// Получает доступные слоты для выбранной даты
function getSlotsForDate(date) {
	const busySlots = getBusySlotsForDate(date);

	return BOOKING_STATE.slots.map((time) => ({
		time: time,
		busy: busySlots.includes(time),
	}));
}

// Находит первое свободное время
function findFirstAvailableTime(date) {
	const availableSlots = getSlotsForDate(date);

	const firstAvailable = availableSlots.find(
		(slot) => !slot.busy
	);

	return firstAvailable ? firstAvailable.time : null;
}

// Форматирует дату для нижней панели
function formatSelectedDate(date) {
	const weekday = DAYS_OF_WEEK[date.getDay()];
	const day = date.getDate();
	const month = MONTHS_GENITIVE[date.getMonth()];
	const year = date.getFullYear();

	return `${weekday}, ${day} ${month} ${year}`;
}


/* 4. ДОПОЛНИТЕЛЬНЫЕ СТИЛИ*/

function injectCalendarStyles() {
	if (document.querySelector("#booking-dynamic-styles")) {
		return;
	}

	const style = document.createElement("style");

	style.id = "booking-dynamic-styles";

	style.textContent = `
		.cal-day.disabled,
		.cal-day:disabled {
			opacity: 0.35;
			cursor: not-allowed;
			pointer-events: none;
		}

		.cal-day.outside-month {
			opacity: 0.35;
			cursor: default;
		}

		.cal-nav button:disabled {
			opacity: 0.3;
			cursor: not-allowed;
		}

		.time-slot.busy,
		.time-slot:disabled {
			opacity: 0.35;
			cursor: not-allowed;
			pointer-events: none;
			text-decoration: line-through;
		}

		.cal-day {
			font: inherit;
		}
	`;

	document.head.appendChild(style);
}


/*  5. ОТРИСОВКА КАЛЕНДАРЯ */

function renderCalendar() {
	const monthTitle = document.querySelector(".cal-head h3");
	const calendarGrid = document.querySelector(".cal-grid");
	const weekdayRow = document.querySelector(".cal-dow-row");

	if (!monthTitle || !calendarGrid || !weekdayRow) {
		console.error(
			"Не найдены элементы календаря. Проверь классы в HTML."
		);

		return;
	}

	// Заголовок месяца
	monthTitle.textContent =
		`${MONTHS_NOMINATIVE[BOOKING_STATE.currentMonth]} ` +
		`${BOOKING_STATE.currentYear}`;

	// Дни недели
	weekdayRow.innerHTML = DAYS_OF_WEEK_SHORT
		.map((day) => `<div class="cal-dow">${day}</div>`)
		.join("");

	// Формируем сетку календаря
	const weeks = buildCalendarGrid(
		BOOKING_STATE.currentYear,
		BOOKING_STATE.currentMonth
	);

	const selectedDate = getSelectedDate();

	calendarGrid.innerHTML = weeks
		.flat()
		.map((cell) => {
			const date = getDateFromCell(cell);
			const isCurrentMonth = cell.monthOffset === 0;
			const isSelected =
				isCurrentMonth &&
				cell.day === BOOKING_STATE.selectedDay;

			const selectable = isDateSelectable(date);

			const classes = ["cal-day"];

			if (!isCurrentMonth) {
				classes.push("muted", "outside-month");
			}

			if (isSelected) {
				classes.push("selected");
			}

			if (!selectable || !isCurrentMonth) {
				classes.push("disabled");
			}

			const disabledAttribute =
				!selectable || !isCurrentMonth ? "disabled" : "";

			const todayClass =
				compareDates(date, BOOKING_STATE.today) === 0
					? "today"
					: "";

			if (todayClass) {
				classes.push(todayClass);
			}

			return `
				<button
					type="button"
					class="${classes.join(" ")}"
					data-day="${cell.day}"
					data-month-offset="${cell.monthOffset}"
					${disabledAttribute}
					aria-pressed="${isSelected}"
					aria-label="${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}"
				>
					${cell.day}
				</button>
			`;
		})
		.join("");

	// Обработчики кликов по датам
	calendarGrid.querySelectorAll(".cal-day").forEach((button) => {
		button.addEventListener("click", () => {
			if (button.disabled) return;

			const day = Number(button.dataset.day);
			const monthOffset = Number(
				button.dataset.monthOffset
			);

			// Ячейки соседних месяцев выбирать нельзя.
			// Для перехода между месяцами используются стрелки.
			if (monthOffset !== 0) return;

			onDayClick(day);
		});
	});

	// Обновляем доступность кнопки предыдущего месяца
	updateMonthNavigation();
}


/*  6. ОТРИСОВКА ВРЕМЕНИ */

function renderTimeSlots() {
	const timeGrid = document.querySelector(".time-grid");

	if (!timeGrid) {
		console.error("Не найден элемент .time-grid.");

		return;
	}

	const selectedDate = getSelectedDate();

	const slots = getSlotsForDate(selectedDate);

	// Если выбранное время занято, выбираем первое свободное.
	const selectedSlotStillAvailable = slots.some(
		(slot) =>
			slot.time === BOOKING_STATE.selectedTime &&
			!slot.busy
	);

	if (!selectedSlotStillAvailable) {
		BOOKING_STATE.selectedTime =
			findFirstAvailableTime(selectedDate);
	}

	timeGrid.innerHTML = slots
		.map((slot) => {
			const isSelected =
				slot.time === BOOKING_STATE.selectedTime;

			const classes = ["time-slot"];

			if (slot.busy) {
				classes.push("busy");
			}

			if (isSelected) {
				classes.push("selected");
			}

			return `
				<button
					type="button"
					class="${classes.join(" ")}"
					data-time="${slot.time}"
					${slot.busy ? "disabled" : ""}
					aria-pressed="${isSelected}"
				>
					${slot.time}
					${slot.busy ? '<span class="slot-status">Занято</span>' : ""}
				</button>
			`;
		})
		.join("");

	// Обработчики выбора времени
	timeGrid.querySelectorAll(".time-slot").forEach((button) => {
		button.addEventListener("click", () => {
			if (button.disabled) return;

			onTimeSlotClick(button.dataset.time);
		});
	});
}


/*  7. ОБНОВЛЕНИЕ НИЖНЕЙ ПАНЕЛИ */

function updateBottomBar() {
	const summaryText = document.querySelector(".summary-text");

	if (!summaryText) {
		console.warn("Не найден элемент .summary-text.");

		return;
	}

	const selectedDate = getSelectedDate();
	const formattedDate = formatSelectedDate(selectedDate);
	const selectedTime = BOOKING_STATE.selectedTime;

	summaryText.textContent =
		`${BOOKING_DETAILS.master} · ` +
		`${BOOKING_DETAILS.service} · ` +
		`${formattedDate}` +
		(selectedTime ? `, ${selectedTime}` : ", время не выбрано");
}


/* 8. ОБРАБОТЧИКИ СОБЫТИЙ */

// Выбор даты
function onDayClick(day) {
	const newDate = new Date(
		BOOKING_STATE.currentYear,
		BOOKING_STATE.currentMonth,
		day
	);

	if (!isDateSelectable(newDate)) {
		return;
	}

	BOOKING_STATE.selectedDay = day;

	// При выборе даты автоматически выбираем первое свободное время
	BOOKING_STATE.selectedTime =
		findFirstAvailableTime(newDate);

	renderCalendar();
	renderTimeSlots();
	updateBottomBar();
}

// Выбор времени
function onTimeSlotClick(time) {
	const selectedDate = getSelectedDate();

	const slots = getSlotsForDate(selectedDate);

	const selectedSlot = slots.find(
		(slot) => slot.time === time
	);

	if (!selectedSlot || selectedSlot.busy) {
		return;
	}

	BOOKING_STATE.selectedTime = time;

	renderTimeSlots();
	updateBottomBar();
}

// Переход между месяцами
function changeMonth(offset) {
	const newDate = new Date(
		BOOKING_STATE.currentYear,
		BOOKING_STATE.currentMonth + offset,
		1
	);

	// Не разрешаем переходить в прошлые месяцы
	const firstDayOfCurrentMonth = new Date(
		BOOKING_STATE.currentYear,
		BOOKING_STATE.currentMonth,
		1
	);

	const firstDayOfTodayMonth = new Date(
		BOOKING_STATE.today.getFullYear(),
		BOOKING_STATE.today.getMonth(),
		1
	);

	if (
		offset < 0 &&
		compareDates(newDate, firstDayOfTodayMonth) < 0
	) {
		return;
	}

	BOOKING_STATE.currentMonth = newDate.getMonth();
	BOOKING_STATE.currentYear = newDate.getFullYear();

	// Для текущего месяца выбираем сегодняшнее число.
	// Для будущего — первое число месяца.
	if (
		BOOKING_STATE.currentYear === BOOKING_STATE.today.getFullYear() &&
		BOOKING_STATE.currentMonth === BOOKING_STATE.today.getMonth()
	) {
		BOOKING_STATE.selectedDay =
			BOOKING_STATE.today.getDate();
	} else {
		BOOKING_STATE.selectedDay = 1;
	}

	const selectedDate = getSelectedDate();

	BOOKING_STATE.selectedTime =
		findFirstAvailableTime(selectedDate);

	renderCalendar();
	renderTimeSlots();
	updateBottomBar();
}

// Настройка кнопок переключения месяца
function setupMonthNavigation() {
	const navigationButtons = document.querySelectorAll(
		".cal-nav button"
	);

	navigationButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const label = (
				button.getAttribute("aria-label") || ""
			).toLowerCase();

			if (
				label.includes("предыдущ") ||
				label.includes("prev")
			) {
				changeMonth(-1);
			} else if (
				label.includes("следующ") ||
				label.includes("next")
			) {
				changeMonth(1);
			}
		});
	});
}

// Обновление состояния кнопок навигации
function updateMonthNavigation() {
	const navigationButtons = document.querySelectorAll(
		".cal-nav button"
	);

	const currentMonthDate = new Date(
		BOOKING_STATE.currentYear,
		BOOKING_STATE.currentMonth,
		1
	);

	const todayMonthDate = new Date(
		BOOKING_STATE.today.getFullYear(),
		BOOKING_STATE.today.getMonth(),
		1
	);

	navigationButtons.forEach((button) => {
		const label = (
			button.getAttribute("aria-label") || ""
		).toLowerCase();

		const isPreviousButton =
			label.includes("предыдущ") ||
			label.includes("prev");

		if (isPreviousButton) {
			button.disabled =
				compareDates(currentMonthDate, todayMonthDate) <= 0;
		}
	});
}


/* 9. КНОПКИ «НАЗАД» И «ПРОДОЛЖИТЬ» */

function setupBackButton() {
	const backButton = document.querySelector(".btn-back");

	if (!backButton) return;

	backButton.addEventListener("click", () => {
		// Возвращаемся на предыдущую страницу, если она есть.
		if (window.history.length > 1) {
			window.history.back();
		} else {
			console.log("Предыдущая страница не найдена.");
		}
	});
}

function setupContinueButton() {
	const continueButton = document.querySelector(".btn-continue");

	if (!continueButton) return;

	continueButton.addEventListener("click", () => {
		if (!BOOKING_STATE.selectedTime) {
			alert("Пожалуйста, выберите доступное время.");

			return;
		}

		const selectedDate = getSelectedDate();

		const booking = {
			master: BOOKING_DETAILS.master,
			service: BOOKING_DETAILS.service,
			date: dateKey(selectedDate),
			time: BOOKING_STATE.selectedTime,
		};

		// Сохраняем данные записи в браузере
		try {
			localStorage.setItem(
				"barberbro-booking",
				JSON.stringify(booking)
			);
		} catch (error) {
			console.warn(
				"Не удалось сохранить запись в localStorage:",
				error
			);
		}

		alert(
			"Вы выбрали:\n" +
			`${BOOKING_DETAILS.master}\n` +
			`${BOOKING_DETAILS.service}\n` +
			`${formatSelectedDate(selectedDate)}\n` +
			`${BOOKING_STATE.selectedTime}\n\n` +
			"Данные сохранены. Следующий шаг пока не реализован."
		);
	});
}


/* 10. ИНИЦИАЛИЗАЦИЯ */

function init() {
	injectCalendarStyles();

	// При открытии страницы выбрана текущая дата.
	BOOKING_STATE.currentMonth = BOOKING_STATE.today.getMonth();
	BOOKING_STATE.currentYear = BOOKING_STATE.today.getFullYear();
	BOOKING_STATE.selectedDay = BOOKING_STATE.today.getDate();

	// Автоматически выбираем первое свободное время.
	BOOKING_STATE.selectedTime =
		findFirstAvailableTime(getSelectedDate());

	// Отрисовываем интерфейс
	renderCalendar();
	renderTimeSlots();
	updateBottomBar();

	// Подключаем обработчики событий
	setupMonthNavigation();
	setupBackButton();
	setupContinueButton();
}

// Запускаем код после загрузки HTML
document.addEventListener("DOMContentLoaded", init);