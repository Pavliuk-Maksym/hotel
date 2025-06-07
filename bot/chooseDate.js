import { Telegraf, Markup, Scenes } from "telegraf";

import start from "./start.js";

import Room from "../modules/rooms.js";
import Booking from "../modules/booking.js";
import Confirm from "../modules/confirmBooking.js";

const pickDate = new Scenes.BaseScene("pickDate");
pickDate.enter(async (ctx) => {
  ctx.session.data = {};
  await ctx.reply("Введіть дату в форматі: ДД:ММ:РРРР");
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

  await ctx.reply(
    "На цю дату вільні такі номери",
    Markup.inlineKeyboard(buttons)
  );

  return ctx.scene.enter("messenger");
});

const messenger = new Scenes.BaseScene("messenger");

const roomDescriptions = {
  Економ: `<b>Двокімнатний двомісний економ</b>
Просторий двокімнатний номер середньою площею 40 м². Складається з вітальні, спальні та ванної кімнати. У спальні – одне двоспальне ліжко, у вітальні – розкладний диван. На вимогу надається дитяче ліжечко.
Ціна: 1250 грн`,

  Стандарт: `<b>Двокімнатний двомісний стандарт</b>
Просторий двокімнатний номер середньою площею 40 м². Складається з вітальні, спальні та ванної кімнати. У спальні – високоякісне ліжко king-size, у вітальні – розкладний диван. На вимогу надається дитяче ліжечко.
Ціна: 1450 грн`,

  Напівлюкс: `<b>Однокімнатний одномісний напівлюкс</b>
Покращений однокімнатний номер середньою площею 19 м². Ідеально підходить для ділових людей, котрі подорожують з комфортом. В номері одне полуторне ліжко.
Ціна: 1700 грн`,

  Люкс: `<b>Двомісний люкс «Класік»</b>
Розкішний двокімнатний номер або номер-студія середньою площею 60 м². Складається зі спальні, вітальні та ванної кімнати. У спальні – високоякісне ліжко king-size, у вітальні – розкладний диван. На вимогу надається дитяче ліжечко. Номер створений для найбільш вибагливих гостей.
Ціна: 2700 грн`,
};

const TOTAL_ROOMS = 5;

async function handleRoomAction(ctx, classRoom) {
  // Считаем количество занятых броней на выбранную дату
  const count = await Booking.countDocuments({
    classRoom,
    date: ctx.session.data.date,
  });

  const available = TOTAL_ROOMS - count;

  if (available <= 0) {
    await ctx.reply(
      "На жаль, на обрану вами дату немає вільних номерів, поверніться до списку та оберіть інший із запропонованих"
    );
    return ctx.scene.enter("checkDate");
  }

  const room = await Room.findOne({ classRoom });

  if (!room || !room.image) {
    await ctx.reply("Room not found");
    return;
  }

  for (const image of room.image) {
    await ctx.replyWithPhoto({ source: image });
  }

  await ctx.replyWithHTML(roomDescriptions[classRoom]);
  ctx.session.data.classRoom = classRoom;

  await ctx.reply(
    "Виберіть Бронювати чи вернутись",
    Markup.keyboard([["Бронювати", "Назад"]])
      .oneTime()
      .resize()
  );

  return ctx.scene.enter("backOrQuantityNight");
}

// Обработка для всех комнат через единый обработчик
["Економ", "Стандарт", "Напівлюкс", "Люкс"].forEach((classRoom) => {
  messenger.action(classRoom, (ctx) => handleRoomAction(ctx, classRoom));
});

const backOrQuantityNight = new Scenes.BaseScene("backOrQuantityNight");

backOrQuantityNight.hears("Бронювати", async (ctx) => {
  await ctx.reply(
    "Введіть кількість ночей, які бажаєте провести в нашому готелі"
  );
  return ctx.scene.enter("howManyNight");
});

backOrQuantityNight.hears("Назад", async (ctx) => {
  return ctx.scene.enter("checkDate");
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
  const regex = /^([a-zA-Zа-яА-ЯёЁіІїЇєЄ']+(\s|$)){2}[a-zA-Zа-яА-ЯёЁіІїЇєЄ']+$/;

  if (!regex.test(input)) {
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
  const regex = /^\+380\d{9}$/;

  if (!regex.test(input)) {
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
  return ctx.scene.enter("checkDate");
});

const paid = new Scenes.BaseScene("paid");

paid.hears("Сплачено", async (ctx) => {
  const { date, night, classRoom, fullName, phoneNumber } = ctx.session.data;
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

  return start(ctx); // возвращает на старт
});

paid.hears("Назад", async (ctx) => {
  return ctx.scene.enter("checkData");
});

export {
  pickDate,
  checkDate,
  messenger,
  backOrQuantityNight,
  howManyNight,
  fullName,
  phone,
  checkData,
  details,
  paid,
};
