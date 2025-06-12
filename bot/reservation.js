import { Composer, Scenes, Markup } from "telegraf";
import Confirm from "../modules/confirmBooking.js"; // Модель базы данных для подтвержденных броней
import CancelRequest from "../modules/cancelRequest.js";
import Booking from "../modules/booking.js";

const reservation = new Composer();

let cancelState = {};

// Обработчик кнопки "Отменить бронь"
reservation.hears("Отменить бронь", async (ctx) => {
  const userName = ctx.update.message.from.username;
  const confirms = await Confirm.find({ userName });
  if (confirms.length === 0) {
    await ctx.reply(
      "У вас нет активных броней для отмены.",
      Markup.keyboard([["Назад в главное меню"]]).oneTime().resize()
    );
    return;
  }
  for (const booking of confirms) {
    await ctx.replyWithHTML(
      `<b>Бронь №${booking._id}</b>\n` +
      `<b>Дата бронювання:</b> ${booking.date}\n` +
      `<b>Номер:</b> ${booking.classRoom}\n` +
      `<b>ПБІ:</b> ${booking.fullName}\n` +
      `<b>Телефон:</b> ${booking.phoneNumber}\n` +
      `<b>ID для отмены:</b> <code>${booking._id}</code>`
    );
  }
  await ctx.reply(
    "Правила отмены:\n- За 2 дня и более до даты заезда — полный возврат средств.\n- Менее чем за 2 дня — возврат 20% от стоимости.\n\nВведите номер (ID) вашей брони для отмены (скопируйте из сообщения выше):",
    Markup.keyboard([["Назад в главное меню"]]).oneTime().resize()
  );
  cancelState[ctx.from.id] = true;
});

// Обработчик кнопки "Назад в главное меню"
reservation.hears("Назад в главное меню", async (ctx) => {
  await ctx.scene.leave();
  await ctx.reply(
    "Виберіть, що вас цікавить",
    Markup.keyboard([["Ввести дату"], ["Порядок заселення", "Ваші бронювання"]])
      .oneTime()
      .resize()
  );
  cancelState[ctx.from.id] = false;
});

// Обработка текста пользователя в сцене "reservationWizard"
reservation.on("text", async (ctx) => {
  const userName = ctx.update.message.from.username;
  const userIdFromCtx = ctx.from.id;
  if (cancelState[userIdFromCtx]) {
    const bookingId = ctx.message.text.trim();
    // Проверка на валидный ObjectId
    if (!/^[a-fA-F0-9]{24}$/.test(bookingId)) {
      await ctx.reply(
        "Ошибка: введите корректный номер (ID) брони, скопированный из сообщения выше.",
        Markup.keyboard([["Назад в главное меню"]]).oneTime().resize()
      );
      return;
    }
    const booking = await Confirm.findOne({ _id: bookingId, userName });
    if (!booking) {
      await ctx.reply(
        "Бронь с таким номером не найдена. Проверьте номер и попробуйте снова.",
        Markup.keyboard([["Назад в главное меню"]]).oneTime().resize()
      );
      return;
    }
    // Проверяем, есть ли уже заявка
    const existing = await CancelRequest.findOne({ bookingId, status: "pending" });
    if (existing) {
      await ctx.reply(
        "Заявка на отмену этой брони уже подана и находится в обработке.",
        Markup.keyboard([["Назад в главное меню"]]).oneTime().resize()
      );
      return;
    }
    // Получаем все нужные поля
    let userId = booking.userId;
    let classRoom = booking.classRoom;
    let date = booking.date;
    let price = booking.price;
    if (!userId || !classRoom || !date || !price) {
      const bookingDoc = await Booking.findOne({ _id: bookingId, userName });
      if (bookingDoc) {
        userId = userId || bookingDoc.userId;
        classRoom = classRoom || bookingDoc.classRoom;
        date = date || bookingDoc.date;
        price = price || bookingDoc.price;
      }
    }
    if (!userId || !classRoom || !date || !price) {
      await ctx.reply("Ошибка: не удалось определить все данные для заявки на отмену. Обратитесь к администратору.");
      cancelState[userIdFromCtx] = false;
      return;
    }
    // Рассчитываем процент возврата
    const now = new Date();
    const bookingDate = new Date(date);
    const daysUntil = Math.floor((bookingDate - now) / (1000 * 60 * 60 * 24));
    let refundPercentage = 20;
    if (daysUntil >= 2) refundPercentage = 100;
    const refundAmount = Math.round(price * (refundPercentage / 100));
    // Создаём заявку
    await CancelRequest.create({
      bookingId: booking._id,
      userId,
      userName,
      fullName: booking.fullName,
      phoneNumber: booking.phoneNumber,
      classRoom,
      date,
      price,
      refundAmount,
      refundPercentage,
      status: "pending"
    });
    await ctx.reply(
      `Ваша заявка на отмену принята и будет рассмотрена администратором.\nВ случае одобрения возврат составит ${refundPercentage}% (${refundAmount} грн). Ожидайте уведомления.`,
      Markup.keyboard([["Назад в главное меню"]]).oneTime().resize()
    );
    cancelState[userIdFromCtx] = false;
    return;
  }

  // Обычный сценарий: выводим список броней
  const confirms = await Confirm.find({ userName });
  if (confirms.length === 0) {
    await ctx.reply(
      "Бронювання ще підтверджується або в вас немає бронювань",
      Markup.keyboard([["Назад в главное меню"]]).oneTime().resize()
    );
    return;
  }
  for (const booking of confirms) {
    await ctx.replyWithHTML(
      `<b>Бронь №${booking._id}</b>\n` +
      `<b>Дата бронювання:</b> ${booking.date}\n` +
      `<b>Номер:</b> ${booking.classRoom}\n` +
      `<b>ПБІ:</b> ${booking.fullName}\n` +
      `<b>Телефон:</b> ${booking.phoneNumber}\n`
    );
  }
  await ctx.reply(
    "Выберите действие:",
    Markup.keyboard([
      ["Назад в главное меню", "Отменить бронь"]
    ]).oneTime().resize()
  );
});

// Создаём сцену бронирования
const reservationScene = new Scenes.WizardScene(
  "reservationWizard", // Название сцены
  reservation
);

export default reservationScene;
