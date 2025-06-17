import { Telegraf, Markup, Scenes } from "telegraf";

import start from "../start.js";

import Room from "../../modules/rooms.js";
import Booking from "../../modules/booking.js";

const checkData = new Scenes.BaseScene("checkData");

checkData.enter(async (ctx) => {
  const { date, classRoom, fullName, phoneNumber, night, hotelCity } =
    ctx.session.data;
  const room = await Room.findOne({ classRoom });
  const price = room.price * night;

  await ctx.replyWithHTML(
    `<b>🏙️ Місто:</b> ${hotelCity}
<b>📅 Дата:</b> ${date}
<b>🏨 Номер:</b> ${classRoom}
<b>👤 ПІБ:</b> ${fullName}
<b>📞 Телефон:</b> ${phoneNumber}
<b>🛏 Кількість ночей:</b> ${night}
<b>💰 Загальна ціна:</b> ${price} грн`
  );

  await ctx.reply(
    "Все вірно?",
    Markup.inlineKeyboard([
      [Markup.button.callback("Так", "Так")],
      [Markup.button.callback("Ні", "Ні")],
    ])
  );

  return ctx.scene.enter("details");
});

const details = new Scenes.BaseScene("details");

details.action("Так", async (ctx) => {
  await ctx.replyWithHTML(
    `<b>Наші реквізити для сплати:</b>
Отримувач коштів: "Чернівці"
Код отримувача: 45861336
Банк: КендіБанк
Рахунок: UA2541323652000121456321457895`,
    Markup.keyboard([["Сплачено"], ["Назад"]])
      .oneTime()
      .resize()
  );
  return ctx.scene.enter("paid");
});

details.action("Ні", async (ctx) => {
  return ctx.scene.enter("phone");
});

const paid = new Scenes.BaseScene("paid");

paid.hears("Сплачено", async (ctx) => {
  const { date, night, classRoom, fullName, phoneNumber, hotelCity } =
    ctx.session.data;
  const user = ctx.update.message.from;
  const userId = user.id;
  const userName = user.username || "unknown";

  const room = await Room.findOne({ classRoom });
  if (!room) {
    await ctx.reply("Помилка: номер не знайдено. Спробуйте ще раз пізніше.");
    return ctx.scene.enter("checkDate");
  }

  // Дата виїзду
  const [day, month, year] = date.split(":").map(Number);
  const checkIn = new Date(year, month - 1, day);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + parseInt(night));

  const beforeDate = `${String(checkOut.getDate()).padStart(2, "0")}:${String(
    checkOut.getMonth() + 1
  ).padStart(2, "0")}:${checkOut.getFullYear()}`;

  const now = new Date();
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

  const price = room.price * parseInt(night);

  const booking = new Booking({
    userName,
    userId,
    date,
    time,
    beforeDate,
    hotelCity,
    classRoom,
    night,
    price,
    phoneNumber,
    fullName,
  });

  try {
    await booking.save();
    console.log("✅ Бронювання збережено.");
    await ctx.reply(
      "✅ Чекайте на підтвердження бронювання. Статус та номер замовлення буде надіслано в бот."
    );
  } catch (err) {
    console.error("❌ Помилка збереження у БД:", err);
    await ctx.reply(
      "❌ Виникла помилка при збереженні бронювання. Спробуйте пізніше."
    );
    return ctx.scene.enter("checkDate");
  }

  // Показываем главное меню без проверки возраста
  await ctx.scene.leave();
  await ctx.reply(
    "Виберіть, що вас цікавить",
    Markup.keyboard([["Ввести дату"], ["Порядок заселення", "Ваші бронювання"]])
      .oneTime()
      .resize()
  );
  return;
});

paid.hears("Назад", async (ctx) => {
  return ctx.scene.enter("checkData");
});

export { checkData, details, paid };
