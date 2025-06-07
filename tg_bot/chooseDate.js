import { Telegraf, Markup, Scenes } from "telegraf";

import start from "./start.js";

import Room from "../modules/rooms.js";
import Booking from "../modules/booking.js";
import Confirm from "../modules/confirmBooking.js";

const pickDate = new Scenes.BaseScene("pickDate");
pickDate.enter(async (ctx) => {
  ctx.session.data = {};
  await ctx.reply("Введіть в такому форматі : ДД:ММ:РР");
});

pickDate.on("text", async (ctx) => {
  ctx.session.data.date = await ctx.message.text;
  return ctx.scene.enter("checkDate");
});

const checkDate = new Scenes.BaseScene("checkDate");
checkDate.enter(async (ctx) => {
  const inputDate = await ctx.session.data.date;
  const today = new Date();

  const regex = /^(\d{2}):(\d{2}):(\d{4})$/;
  if (!regex.test(inputDate)) {
    await ctx.reply("Помилка: Некоректний формат дати");
    return ctx.scene.enter("pickDate");
  }

  const maxDate = new Date(2023, 11, 31);
  if (inputDate > maxDate) {
    await ctx.reply("Помилка: Дата має бути до 31 грудня 2023 року");
    return ctx.scene.enter("pickDate");
  }

  const [day, month, year] = inputDate.split(":").map(Number);

  if (day > 31) {
    await ctx.reply("Помилка: Некоректний формат дати");
    return ctx.scene.enter("pickDate");
  }

  if (month > 12) {
    await ctx.reply("Помилка: Некоректний формат дати");
    return ctx.scene.enter("pickDate");
  }

  const inputDateWithoutTime = new Date(year, month - 1, day);
  const todayWithoutTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (inputDateWithoutTime < todayWithoutTime) {
    await ctx.reply("Помилка: Дата не може бути меншою за сьогоднішню");
    return ctx.scene.enter("pickDate");
  }

  const economfunc = async (ctx) => {
    let countBooking = 0;
    let countConfirm = 0;
    const booking = await Booking.find({ classRoom: "Економ" });
    const confirm = await Confirm.find({ classRoom: "Економ" });
    booking.forEach((booking) => {
      const date1Parts = booking.beforeDate.split(":");
      const date2Parts = ctx.session.data.date.split(":");
      const date1 = new Date(date1Parts[2], date1Parts[1] - 1, date1Parts[0]);
      const date2 = new Date(date2Parts[2], date2Parts[1] - 1, date2Parts[0]);
      if (date1 > date2) {
        countBooking += 1;
      }
    });
    confirm.forEach((booking) => {
      const date1Parts = booking.beforeDate.split(":");
      const date2Parts = ctx.session.data.date.split(":");
      const date1 = new Date(date1Parts[2], date1Parts[1] - 1, date1Parts[0]);
      const date2 = new Date(date2Parts[2], date2Parts[1] - 1, date2Parts[0]);
      if (date1 > date2) {
        countConfirm += 1;
      }
    });
    return 5 - countBooking - countConfirm;
  };
  const standartfunc = async (ctx) => {
    let countBooking = 0;
    let countConfirm = 0;
    const booking = await Booking.find({ classRoom: "Стандарт" });
    const confirm = await Confirm.find({ classRoom: "Стандарт" });
    booking.forEach((booking) => {
      const date1Parts = booking.beforeDate.split(":");
      const date2Parts = ctx.session.data.date.split(":");
      const date1 = new Date(date1Parts[2], date1Parts[1] - 1, date1Parts[0]);
      const date2 = new Date(date2Parts[2], date2Parts[1] - 1, date2Parts[0]);
      if (date1 > date2) {
        countBooking += 1;
      }
    });
    confirm.forEach((booking) => {
      const date1Parts = booking.beforeDate.split(":");
      const date2Parts = ctx.session.data.date.split(":");
      const date1 = new Date(date1Parts[2], date1Parts[1] - 1, date1Parts[0]);
      const date2 = new Date(date2Parts[2], date2Parts[1] - 1, date2Parts[0]);
      if (date1 > date2) {
        countConfirm += 1;
      }
    });
    return 5 - countBooking - countConfirm;
  };
  const napivLuxyfunc = async (ctx) => {
    let countBooking = 0;
    let countConfirm = 0;
    const booking = await Booking.find({ classRoom: "Напівлюкс" });
    const confirm = await Confirm.find({ classRoom: "Напівлюкс" });
    booking.forEach((booking) => {
      const date1Parts = booking.beforeDate.split(":");
      const date2Parts = ctx.session.data.date.split(":");
      const date1 = new Date(date1Parts[2], date1Parts[1] - 1, date1Parts[0]);
      const date2 = new Date(date2Parts[2], date2Parts[1] - 1, date2Parts[0]);
      if (date1 > date2) {
        countBooking += 1;
      }
    });
    confirm.forEach((booking) => {
      const date1Parts = booking.beforeDate.split(":");
      const date2Parts = ctx.session.data.date.split(":");
      const date1 = new Date(date1Parts[2], date1Parts[1] - 1, date1Parts[0]);
      const date2 = new Date(date2Parts[2], date2Parts[1] - 1, date2Parts[0]);
      if (date1 > date2) {
        countConfirm += 1;
      }
    });
    return 5 - countBooking - countConfirm;
  };
  const luxyfunc = async (ctx) => {
    let countBooking = 0;
    let countConfirm = 0;
    const booking = await Booking.find({ classRoom: "Люкс" });
    const confirm = await Confirm.find({ classRoom: "Люкс" });
    booking.forEach((booking) => {
      const date1Parts = booking.beforeDate.split(":");
      const date2Parts = ctx.session.data.date.split(":");
      const date1 = new Date(date1Parts[2], date1Parts[1] - 1, date1Parts[0]);
      const date2 = new Date(date2Parts[2], date2Parts[1] - 1, date2Parts[0]);
      if (date1 > date2) {
        countBooking += 1;
      }
    });
    confirm.forEach((booking) => {
      const date1Parts = booking.beforeDate.split(":");
      const date2Parts = ctx.session.data.date.split(":");
      const date1 = new Date(date1Parts[2], date1Parts[1] - 1, date1Parts[0]);
      const date2 = new Date(date2Parts[2], date2Parts[1] - 1, date2Parts[0]);
      if (date1 > date2) {
        countConfirm += 1;
      }
    });
    return 5 - countBooking - countConfirm;
  };

  const econom = await economfunc(ctx);
  const standart = await standartfunc(ctx);
  const napivLuxy = await napivLuxyfunc(ctx);
  const luxy = await luxyfunc(ctx);

  await ctx.reply(
    "На цю дату вільні такі номери",
    Markup.inlineKeyboard([
      [Markup.button.callback(`Економ ${econom}`, "Економ")],
      [Markup.button.callback(`Стандарт ${standart}`, "Стандарт")],
      [Markup.button.callback(`Напівлюкс ${napivLuxy}`, "Напівлюкс")],
      [Markup.button.callback(`Люкс ${luxy}`, "Люкс")],
    ])
  );
  return ctx.scene.enter("messenger");
});

const messenger = new Scenes.BaseScene("messenger");
messenger.action("Економ", async (ctx) => {
  const economfunc = async (ctx) => {
    const count = await Booking.countDocuments({
      classRoom: "Економ",
      date: ctx.session.data.date,
    });
    return 5 - count;
  };

  const econom = await economfunc(ctx);

  if (econom != 0) {
    const room = await Room.findOne({ classRoom: "Економ" });
    if (room && room.image) {
      for (const image of room.image) {
        await ctx.replyWithPhoto({ source: image });
      }
      await ctx.replyWithHTML(
        "<b>Двокімнатний двомісний економ</b>\nПросторий двокімнатний номер середньою площею 40 м². Складається з вітальні, спальні та ванної кімнати. У спальні – одне двоспальне ліжко, у вітальні – розкладний диван. На вимогу надається дитяче ліжечко.\nЦіна: 1250 грн"
      );
      ctx.session.data.classRoom = "Економ";
      await ctx.reply(
        "Виберіть Бронювати чи вернутись",
        Markup.keyboard([["Бронювати", "Назад"]])
          .oneTime()
          .resize()
      );
    } else {
      await ctx.reply("Room not found");
    }
  } else {
    await ctx.reply(
      "На жаль, на обрану вами дату немає вільних номерів , поверніться до списку та оберіть інший із запропонованих "
    );
    return ctx.scene.enter("checkDate");
  }
  return ctx.scene.enter("backOrQuantityNight");
});

messenger.action("Стандарт", async (ctx) => {
  const economfunc = async (ctx) => {
    const count = await Booking.countDocuments({
      classRoom: "Стандарт",
      date: ctx.session.data.date,
    });
    return 5 - count;
  };

  const econom = await economfunc(ctx);

  if (econom != 0) {
    const room = await Room.findOne({ classRoom: "Стандарт" });
    if (room && room.image) {
      for (const image of room.image) {
        await ctx.replyWithPhoto({ source: image });
      }
      await ctx.replyWithHTML(
        "<b>Двокімнатний двомісний стандарт</b>\nПросторий двокімнатний номер середньою площею 40 м². Складається з вітальні, спальні та ванної кімнати. У спальні – високоякісне ліжко king-size, у вітальні – розкладний диван. На вимогу надається дитяче ліжечко.\nЦіна: 1450 грн"
      );
      ctx.session.data.classRoom = "Стандарт";
      await ctx.reply(
        "Виберіть Бронювати чи вернутись",
        Markup.keyboard([["Бронювати", "Назад"]])
          .oneTime()
          .resize()
      );
    } else {
      await ctx.reply("Room not found");
    }
  } else {
    await ctx.reply(
      "На жаль, на обрану вами дату немає вільних номерів , поверніться до списку та оберіть інший із запропонованих "
    );
    return ctx.scene.enter("checkDate");
  }
  return ctx.scene.enter("backOrQuantityNight");
});

messenger.action("Напівлюкс", async (ctx) => {
  const economfunc = async (ctx) => {
    const count = await Booking.countDocuments({
      classRoom: "Напівлюкс",
      date: ctx.session.data.date,
    });
    return 5 - count;
  };

  const econom = await economfunc(ctx);

  if (econom != 0) {
    const room = await Room.findOne({ classRoom: "Напівлюкс" });
    if (room && room.image) {
      for (const image of room.image) {
        await ctx.replyWithPhoto({ source: image });
      }
      await ctx.replyWithHTML(
        "<b>Однокімнатний одномісний напівлюкс</b>\nПокращений однокімнатний номер середньою площею 19 м². Ідеально підходить для ділових людей, котрі подорожують з комфортом. В номері одне полуторне ліжко.\nЦіна: 1700 грн"
      );
      ctx.session.data.classRoom = "Напівлюкс";
      await ctx.reply(
        "Виберіть Бронювати чи вернутись",
        Markup.keyboard([["Бронювати", "Назад"]])
          .oneTime()
          .resize()
      );
    } else {
      await ctx.reply("Room not found");
    }
  } else {
    await ctx.reply(
      "На жаль, на обрану вами дату немає вільних номерів , поверніться до списку та оберіть інший із запропонованих "
    );
    return ctx.scene.enter("checkDate");
  }
  return ctx.scene.enter("backOrQuantityNight");
});

messenger.action("Люкс", async (ctx) => {
  const economfunc = async (ctx) => {
    const count = await Booking.countDocuments({
      classRoom: "Люкс",
      date: ctx.session.data.date,
    });
    return 5 - count;
  };

  const econom = await economfunc(ctx);

  if (econom != 0) {
    const room = await Room.findOne({ classRoom: "Люкс" });
    if (room && room.image) {
      for (const image of room.image) {
        await ctx.replyWithPhoto({ source: image });
      }
      await ctx.replyWithHTML(
        "<b>Двомісний люкс «Класік»</b>\nРозкішний двокімнатний номер або номер-студія середньою площею 60 м². Складається зі спальні, вітальні та ванної кімнати. У спальні – високоякісне ліжко king-size, у вітальні – розкладний диван. На вимогу надається дитяче ліжечко. Номер створений для найбільш вибагливих гостей.\nЦіна: 2700 грн"
      );
      ctx.session.data.classRoom = "Люкс";
      await ctx.reply(
        "Виберіть Бронювати чи вернутись",
        Markup.keyboard([["Бронювати", "Назад"]])
          .oneTime()
          .resize()
      );
    } else {
      await ctx.reply("Room not found");
    }
  } else {
    await ctx.reply(
      "На жаль, на обрану вами дату немає вільних номерів , поверніться до списку та оберіть інший із запропонованих "
    );
    return ctx.scene.enter("checkDate");
  }
  return ctx.scene.enter("backOrQuantityNight");
});

const backOrQuantityNight = new Scenes.BaseScene("backOrQuantityNight");
backOrQuantityNight.hears("Бронювати", async (ctx) => {
  await ctx.reply(
    "Введіть кількість ночей які бажаєте провести в нашому отелі"
  );
  return ctx.scene.enter("howManyNight");
});

backOrQuantityNight.hears("Назад", async (ctx) => {
  await ctx.scene.enter("checkDate");
});

const howManyNight = new Scenes.BaseScene("howManyNight");
howManyNight.on("text", async (ctx) => {
  ctx.session.data.night = await ctx.message.text;
  return ctx.scene.enter("fullName");
});

const fullName = new Scenes.BaseScene("fullName");
fullName.enter(async (ctx) => {
  await ctx.reply("Введіть ваші ПІБ за зразком - Комаров Василій Дмитрович");
  return ctx.scene.enter("checkFullName");
});

const checkFullName = new Scenes.BaseScene("checkFullName");
checkFullName.on("text", async (ctx) => {
  const input = ctx.message.text.trim();
  const regex = /^([a-zA-Zа-яА-ЯёЁіІїЇєЄ']+(\s|$)){2}[a-zA-Zа-яА-ЯёЁіІїЇєЄ']+$/;
  if (!regex.test(input)) {
    await ctx.reply("Ви ввели неправильний формат ПІБ. Спробуйте ще раз.");
    await ctx.scene.enter("fullName");
  } else {
    ctx.session.data.fullName = await ctx.message.text;
    return ctx.scene.enter("phone");
  }
});

const phone = new Scenes.BaseScene("phone");
phone.enter(async (ctx) => {
  await ctx.reply("Введіть номер телефону на який буде оформлено бронювання");
  return ctx.scene.enter("checkPhone");
});

const checkPhone = new Scenes.BaseScene("checkPhone");
checkPhone.on("text", async (ctx) => {
  const input = ctx.message.text.trim();
  const regex = /^\+380?\d{9}$/;

  if (!regex.test(input)) {
    await ctx.reply(
      "Ви ввели неправильний формат номера телефону, приклад - +380937465892. Спробуйте ще раз."
    );
    await ctx.scene.enter("phone");
  } else {
    const formattedNumber = input
      .replace(/^(\+38|380)/, "38")
      .replace(/(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})/, "+$1($2)-$3-$4-$5");
    ctx.session.data.phoneNumber = formattedNumber;
    return ctx.scene.enter("checkData");
  }
});

const checkData = new Scenes.BaseScene("checkData");
checkData.enter(async (ctx) => {
  await ctx.reply("Перевірьте правильність введених вами даних");
  const classRoom = ctx.session.data.classRoom;
  const room = await Room.findOne({ classRoom });
  const price = room.price * ctx.session.data.night;

  await ctx.replyWithHTML(
    `<b>Дата бронювання:</b> ${ctx.session.data.date}\n<b>Номер:</b> ${ctx.session.data.classRoom}\n<b>ПБІ:</b> ${ctx.session.data.fullName}\n<b>Телефон:</b> ${ctx.session.data.phoneNumber}\n<b>Ночей: ${ctx.session.data.night}</b>\n<b>Ціна: ${price}</b>`
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
    "<b>Наші реквізити для сплати:</b>\n Отримувач коштів : “Чернівці”\n Код отримувача: 45861336\n Банк: КендіБанк\n Рахунок: UA2541323652000121456321457895",
    Markup.keyboard([["Сплачено"], ["Назад"]])
      .oneTime()
      .resize()
  );
  return ctx.scene.enter("paid");
});

details.action("Ні", async (ctx) => {
  await ctx.scene.enter("checkDate");
});

const paid = new Scenes.BaseScene("paid");
paid.hears("Сплачено", async (ctx) => {
  const user = ctx.update.message.from;
  const date = ctx.session.data.date;
  const night = ctx.session.data.night;
  const userId = user.id;
  const classRoom = ctx.session.data.classRoom;
  const room = await Room.findOne({ classRoom });

  const parts = date.split(":");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  const currentDate = new Date(year, month, day);
  currentDate.setDate(currentDate.getDate() + parseInt(night));
  const days = String(currentDate.getDate()).padStart(2, "0");
  const months = String(currentDate.getMonth() + 1).padStart(2, "0"); // Добавляем 1, так как месяцы в JavaScript начинаются с 0
  const years = currentDate.getFullYear();

  const beforeDate = `${days}:${months}:${years}`;

  const currentTime = new Date();
  const hours = currentTime.getHours();
  // const minutes = currentTime.getMinutes();
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");

  const userName = user.username;
  const time = `${hours}:${minutes}`;
  const price = room.price * ctx.session.data.night;
  const phoneNumber = ctx.session.data.phoneNumber;
  const fullName = ctx.session.data.fullName;

  const newBooking = await new Booking({
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
    await newBooking.save().then(() => console.log("done save"));
  } catch (err) {
    console.error("DB save error:", err);
  }
  await ctx.reply(
    "Чекайте на підтвердження бронювання. В боті буде відправлено вам повідомлення із статусом вашого бронювання та його номером"
  );

  return start(ctx);
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
  checkFullName,
  phone,
  checkPhone,
  checkData,
  details,
  paid,
};
