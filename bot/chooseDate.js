import { Telegraf, Markup, Scenes } from "telegraf";

import start from "./start.js";

import Room from "../modules/rooms.js";
import Booking from "../modules/booking.js";
import Confirm from "../modules/confirmBooking.js";
import {
  parseDate,
  validateFullName,
  validatePhone,
  getRemainingRooms,
  // handleRoomSelection,
} from "./utils.js";

import { roomDescriptions } from "./constants.js";

const pickDate = new Scenes.BaseScene("pickDate");
pickDate.enter(async (ctx) => {
  ctx.session.data = {};
  await ctx.reply("Введіть дату в форматі: ДД:ММ:РРРР");
});

pickDate.on("text", async (ctx) => {
  ctx.session.data.date = ctx.message.text.trim();
  return ctx.scene.enter("messenger");
});

const messenger = new Scenes.BaseScene("messenger");

messenger.enter(async (ctx) => {
  await ctx.reply(
    "Оберіть клас номеру:",
    Markup.inlineKeyboard([
      [Markup.button.callback("Економ", "Економ")],
      [Markup.button.callback("Стандарт", "Стандарт")],
      [Markup.button.callback("Напівлюкс", "Напівлюкс")],
      [Markup.button.callback("Люкс", "Люкс")],
    ])
  );
});

// async function handleRoomAction(ctx, classRoom) {
//   const count = await Booking.countDocuments({
//     classRoom,
//     date: ctx.session.data.date,
//   });

//   const total_rooms = await Room.countDocuments({ classRoom });

//   const available = total_rooms - count;

//   if (available <= 0) {
//     await ctx.reply(
//       "На жаль, на обрану вами дату немає вільних номерів, поверніться до списку та оберіть інший із запропонованих"
//     );
//     return ctx.scene.enter("pickDate");
//   }

//   const room = await Room.findOne({ classRoom });

//   if (!room || !room.image) {
//     await ctx.reply("Room not found");
//     return;
//   }

//   for (const image of room.image) {
//     await ctx.replyWithPhoto({ source: image });
//   }

//   await ctx.replyWithHTML(roomDescriptions[classRoom]);
//   ctx.session.data.classRoom = classRoom;

//   await ctx.reply(
//     "Виберіть Бронювати чи вернутись",
//     Markup.keyboard([["Бронювати", "Назад"]])
//       .oneTime()
//       .resize()
//   );

//   return ctx.scene.enter("backOrQuantityNight");
// }

["Економ", "Стандарт", "Напівлюкс", "Люкс"].forEach((classRoom) => {
  messenger.action(classRoom, async (ctx) => {
    await ctx.answerCbQuery();
    return handleRoomSelection(ctx, classRoom, roomDescriptions[classRoom]);
  });
});

const backOrQuantityNight = new Scenes.BaseScene("backOrQuantityNight");

backOrQuantityNight.hears("Бронювати", async (ctx) => {
  await ctx.reply(
    "Введіть кількість ночей, які бажаєте провести в нашому готелі"
  );
  return ctx.scene.enter("howManyNight");
});

backOrQuantityNight.hears("Назад", async (ctx) => {
  return ctx.scene.enter("pickDate");
});

const howManyNight = new Scenes.BaseScene("howManyNight");

howManyNight.on("text", async (ctx) => {
  const nights = parseInt(ctx.message.text);
  if (isNaN(nights) || nights <= 0 || nights > 30) {
    await ctx.reply("Введіть коректну кількість ночей (від 1 до 30).");
    return;
  }
  ctx.session.data.night = nights;
  return ctx.scene.enter("fullName");
});

const fullName = new Scenes.BaseScene("fullName");

fullName.enter(async (ctx) => {
  await ctx.reply("Введіть ваші ПІБ за зразком — Комаров Василій Дмитрович");
});

fullName.on("text", async (ctx) => {
  const input = ctx.message.text.trim();

  if (!validateFullName(input)) {
    await ctx.reply("❌ Неправильний формат ПІБ. Спробуйте ще раз.");
    return;
  }

  ctx.session.data.fullName = input;
  return ctx.scene.enter("phone");
});

const phone = new Scenes.BaseScene("phone");

phone.enter(async (ctx) => {
  await ctx.reply("📱 Введіть номер телефону у форматі +380XXXXXXXXX");
});

phone.on("text", async (ctx) => {
  const input = ctx.message.text.trim();

  if (!validatePhone(input)) {
    await ctx.reply(
      "❌ Неправильний формат. Приклад: +380937465892. Спробуйте ще раз."
    );
    return;
  }

  const formatted = input.replace(
    /(\+380)(\d{2})(\d{3})(\d{2})(\d{2})/,
    "$1($2)-$3-$4-$5"
  );

  ctx.session.data.phoneNumber = formatted;
  return ctx.scene.enter("checkData");
});

const checkData = new Scenes.BaseScene("checkData");

checkData.enter(async (ctx) => {
  const { date, classRoom, fullName, phoneNumber, night } = ctx.session.data;
  const room = await Room.findOne({ classRoom });
  const price = room.price * night;

  await ctx.replyWithHTML(
    `<b>📅 Дата:</b> ${date}
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
Отримувач коштів: “Чернівці”
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
  return ctx.scene.enter("pickDate");
});

const paid = new Scenes.BaseScene("paid");

paid.hears("Сплачено", async (ctx) => {
  const user = ctx.update.message.from;
  const { date, night, classRoom, phoneNumber, fullName } = ctx.session.data;
  const userId = user.id;
  const userName = user.username;

  const parsedDate = parseDate(date);
  if (!parsedDate) {
    await ctx.reply("❌ Сталася помилка при обробці дати. Спробуйте ще раз.");
    return ctx.scene.enter("pickDate");
  }

  const nightCount = parseInt(night, 10);
  parsedDate.setDate(parsedDate.getDate() + nightCount);
  const days = String(parsedDate.getDate()).padStart(2, "0");
  const months = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const years = parsedDate.getFullYear();
  const beforeDate = `${days}:${months}:${years}`;

  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const time = `${hours}:${minutes}`;

  const room = await Room.findOne({ classRoom });
  const price = room.price * nightCount;

  const newBooking = new Booking({
    userName,
    userId,
    date,
    time,
    beforeDate,
    classRoom,
    night,
    price,
    phoneNumber,
    fullName,
  });

  try {
    await newBooking.save();
    console.log("✅ Booking saved");
  } catch (err) {
    console.error("❌ DB save error:", err);
    await ctx.reply("❌ Сталася помилка при збереженні бронювання.");
    return;
  }

  await ctx.reply(
    "✅ Чекайте на підтвердження бронювання. Ви отримаєте повідомлення із номером бронювання та статусом."
  );

  return start(ctx);
});

paid.hears("Назад", async (ctx) => {
  return ctx.scene.enter("checkData");
});

export {
  pickDate,
  messenger,
  backOrQuantityNight,
  howManyNight,
  fullName,
  phone,
  checkData,
  details,
  paid,
};
