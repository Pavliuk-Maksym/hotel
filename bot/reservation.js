import { Composer, Scenes, Markup } from "telegraf";
import Confirm from "../modules/confirmBooking.js"; // Модель базы данных для подтвержденных броней

const reservation = new Composer();

// Обработчик кнопки "Отменить бронь"
reservation.hears("Отменить бронь", async (ctx) => {
  await ctx.scene.enter("cancelBooking");
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
});

// Обработка текста пользователя в сцене "reservationWizard"
reservation.on("text", async (ctx) => {
  const userName = ctx.update.message.from.username; // Получаем имя пользователя из Telegram

  // Ищем все бронирования по имени пользователя
  const confirms = await Confirm.find({ userName });

  // Если бронирований нет — уведомляем пользователя и выходим из сцены
  if (confirms.length === 0) {
    await ctx.reply(
      "Бронювання ще підтверджується або в вас немає бронювань",
      Markup.keyboard([["Назад в главное меню"]])
        .oneTime()
        .resize()
    );
    return;
  }

  // Если бронирования есть — отправляем информацию по каждому
  for (const booking of confirms) {
    await ctx.replyWithHTML(
      `<b>Бронь №${booking._id}</b>\n` +
      `<b>Дата бронювання:</b> ${booking.date}\n` +
      `<b>Номер:</b> ${booking.classRoom}\n` +
      `<b>ПБІ:</b> ${booking.fullName}\n` +
      `<b>Телефон:</b> ${booking.phoneNumber}\n`
    );
  }

  // После вывода всех бронирований показываем кнопку возврата в меню
  await ctx.reply(
    "Выберите действие:",
    Markup.keyboard([
      ["Назад в главное меню"]
    ])
      .oneTime()
      .resize()
  );
});

// Создаём сцену бронирования
const reservationScene = new Scenes.WizardScene(
  "reservationWizard", // Название сцены
  reservation
);

export default reservationScene;
