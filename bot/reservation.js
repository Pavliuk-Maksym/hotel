import { Composer, Scenes, Markup } from "telegraf";
import Confirm from "../modules/confirmBooking.js"; // Модель бази даних для підтверджених броней
import CancelRequest from "../modules/cancelRequest.js";
import Booking from "../modules/booking.js";

const reservation = new Composer();

let cancelState = {};

// Обробник кнопки "Відмінити бронь"
reservation.hears("Відмінити бронь", async (ctx) => {
  const userName = ctx.update.message.from.username;
  const confirms = await Confirm.find({ userName });
  if (confirms.length === 0) {
    await ctx.reply(
      "У вас немає активних броней для відміни.",
      Markup.keyboard([["Назад в головне меню"]])
        .oneTime()
        .resize()
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
        `<b>ID для відміни:</b> <code>${booking._id}</code>`
    );
  }
  await ctx.reply(
    "Правила відміни:\n- За 2 дні та більше до дати заїзду — повне повернення коштів.\n- Менше ніж за 2 дні — повернення 20% від вартості.\n\nВведіть номер (ID) вашої броні для відміни (скопіюйте з повідомлення вище):",
    Markup.keyboard([["Назад в головне меню"]])
      .oneTime()
      .resize()
  );
  cancelState[ctx.from.id] = true;
});

// Обробник кнопки "Назад в головне меню"
reservation.hears("Назад в головне меню", async (ctx) => {
  await ctx.scene.leave();
  await ctx.reply(
    "Виберіть, що вас цікавить",
    Markup.keyboard([["Ввести дату"], ["Порядок заселення", "Ваші бронювання"]])
      .oneTime()
      .resize()
  );
  cancelState[ctx.from.id] = false;
});

// Обробка тексту користувача в сцені "reservationWizard"
reservation.on("text", async (ctx) => {
  const userName = ctx.update.message.from.username;
  const userIdFromCtx = ctx.from.id;
  if (cancelState[userIdFromCtx]) {
    const bookingId = ctx.message.text.trim();
    // Перевірка на валідний ObjectId
    if (!/^[a-fA-F0-9]{24}$/.test(bookingId)) {
      await ctx.reply(
        "Помилка: введіть коректний номер (ID) броні, скопійований з повідомлення вище.",
        Markup.keyboard([["Назад в головне меню"]])
          .oneTime()
          .resize()
      );
      return;
    }
    const booking = await Confirm.findOne({ _id: bookingId, userName });
    if (!booking) {
      await ctx.reply(
        "Бронь з таким номером не знайдена. Перевірте номер і спробуйте знову.",
        Markup.keyboard([["Назад в головне меню"]])
          .oneTime()
          .resize()
      );
      return;
    }
    // Перевіряємо, чи є вже заявка
    const existing = await CancelRequest.findOne({
      bookingId,
      status: "pending",
    });
    if (existing) {
      await ctx.reply(
        "Заявка на відміну цієї броні вже подана і знаходиться в обробці.",
        Markup.keyboard([["Назад в головне меню"]])
          .oneTime()
          .resize()
      );
      return;
    }
    // Отримуємо всі потрібні поля
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
      await ctx.reply(
        "Помилка: не вдалося визначити всі дані для заявки на відміну. Зверніться до адміністратора."
      );
      cancelState[userIdFromCtx] = false;
      return;
    }
    // Розраховуємо відсоток повернення
    const now = new Date();
    const bookingDate = new Date(date);
    const daysUntil = Math.floor((bookingDate - now) / (1000 * 60 * 60 * 24));
    let refundPercentage = 20;
    if (daysUntil >= 2) refundPercentage = 100;
    const refundAmount = Math.round(price * (refundPercentage / 100));
    // Створюємо заявку
    await CancelRequest.create({
      bookingId: booking._id,
      userId,
      userName,
      fullName: booking.fullName,
      phoneNumber: booking.phoneNumber,
      hotelCity: booking.hotelCity,
      classRoom,
      date,
      price,
      refundAmount,
      refundPercentage,
      status: "pending",
    });
    await ctx.reply(
      `Ваша заявка на відміну прийнята і буде розглянута адміністратором.\nУ разі схвалення повернення складе ${refundPercentage}% (${refundAmount} грн). Очікуйте повідомлення.`,
      Markup.keyboard([["Назад в головне меню"]])
        .oneTime()
        .resize()
    );
    cancelState[userIdFromCtx] = false;
    return;
  }

  // Звичайний сценарій: виводимо список броней
  const confirms = await Confirm.find({ userName });
  if (confirms.length === 0) {
    await ctx.reply(
      "Бронювання ще підтверджується або в вас немає бронювань",
      Markup.keyboard([["Назад в головне меню"]])
        .oneTime()
        .resize()
    );
    return;
  }
  for (const booking of confirms) {
    await ctx.replyWithHTML(
      `<b>Бронь №${booking._id}</b>\n` +
        `<b>Дата бронювання:</b> ${booking.date}\n` +
        `<b>Місто:</b> ${booking.hotelCity}\n` +
        `<b>Номер:</b> ${booking.classRoom}\n` +
        `<b>ПБІ:</b> ${booking.fullName}\n` +
        `<b>Телефон:</b> ${booking.phoneNumber}\n`
    );
  }
  await ctx.reply(
    "Виберіть дію:",
    Markup.keyboard([["Назад в головне меню", "Відмінити бронь"]])
      .oneTime()
      .resize()
  );
});

// Створюємо сцену бронювання
const reservationScene = new Scenes.WizardScene(
  "reservationWizard", // Назва сцени
  reservation
);

export default reservationScene;
