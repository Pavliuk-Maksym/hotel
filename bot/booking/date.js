import { Telegraf, Markup, Scenes } from "telegraf";

import Room from "../../modules/rooms.js";
import Booking from "../../modules/booking.js";
import Confirm from "../../modules/confirmBooking.js";

const pickDate = new Scenes.BaseScene("pickDate");
pickDate.enter(async (ctx) => {
  ctx.session.data = {};
  await ctx.reply("Введіть дату в форматі ДД:ММ:РРРР. Наприклад: 31:12:2025"); // Дату используя для тестов, потом убрать
});

pickDate.on("text", async (ctx) => {
  ctx.session.data.date = ctx.message.text.trim();
  return ctx.scene.enter("checkDate");
});

const checkDate = new Scenes.BaseScene("checkDate");
checkDate.enter(async (ctx) => {
  const inputDate = ctx.session.data.date;
  const today = new Date();

  const regex = /^(\d{2}):(\d{2}):(\d{4})$/;
  if (!regex.test(inputDate)) {
    await ctx.reply("Помилка: Некоректний формат дати");
    return ctx.scene.enter("pickDate");
  }

  const [day, month, year] = inputDate.split(":").map(Number);

  // Проверка даты
  if (day < 1 || day > 31 || month < 1 || month > 12) {
    await ctx.reply("Помилка: Некоректний формат дати");
    return ctx.scene.enter("pickDate");
  }

  const inputDateObj = new Date(year, month - 1, day);
  const maxDate = new Date(2025, 11, 31);
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (inputDateObj > maxDate) {
    await ctx.reply("Помилка: Дата має бути до 31 грудня 2025 року");
    return ctx.scene.enter("pickDate");
  }

  if (inputDateObj < todayDateOnly) {
    await ctx.reply("Помилка: Дата не може бути меншою за сьогоднішню");
    return ctx.scene.enter("pickDate");
  }

  // Функция для подсчёта свободных номеров по типу
  const getRemainingRooms = async (classRoom) => {
    const targetDate = inputDateObj;

    const filterValidDates = (items) =>
      items.filter(({ beforeDate }) => {
        const [d, m, y] = beforeDate.split(":").map(Number);
        const dateObj = new Date(y, m - 1, d);
        return dateObj > targetDate;
      }).length;

    const [booking, confirm, room] = await Promise.all([
      Booking.find({ classRoom }),
      Confirm.find({ classRoom }),
      Room.findOne({ classRoom }),
    ]);

    const countBooking = filterValidDates(booking);
    const countConfirm = filterValidDates(confirm);

    const remaining = room.quantity - countBooking - countConfirm;
    return Math.max(remaining, 0);
  };

  const roomTypes = ["Економ", "Стандарт", "Напівлюкс", "Люкс"];
  const availability = await Promise.all(
    roomTypes.map((type) => getRemainingRooms(type))
  );

  const buttons = roomTypes.map((type, idx) => [
    Markup.button.callback(`${type} ${availability[idx]}`, type),
  ]);

  const inputDateStr = `${String(day).padStart(2, "0")}:${String(
    month
  ).padStart(2, "0")}:${year}`;

  if (availability.every((count) => count <= 0)) {
    await ctx.reply(
      `На дату ${inputDateStr} немає вільних номерів. Спробуйте іншу дату.`
    );
    return ctx.scene.enter("pickDate");
  }

  await ctx.reply(
    `На дату ${inputDateStr} вільні такі номери`,
    Markup.inlineKeyboard(buttons)
  );

  return ctx.scene.enter("messenger");
});

export { pickDate, checkDate };
