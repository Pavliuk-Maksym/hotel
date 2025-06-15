// date.js
import { Markup, Scenes } from "telegraf";

const pickDate = new Scenes.BaseScene("pickDate");

pickDate.enter(async (ctx) => {
  ctx.session.data = {};
  await ctx.reply("Введіть дату в форматі ДД:ММ:РРРР (наприклад 13:06:2025)");
});

pickDate.on("text", async (ctx) => {
  const inputDate = ctx.message.text.trim();
  const regex = /^(\d{2}):(\d{2}):(\d{4})$/;

  if (!regex.test(inputDate)) {
    await ctx.reply("Помилка: Некоректний формат дати");
    return ctx.scene.reenter();
  }

  const [day, month, year] = inputDate.split(":").map(Number);
  const inputDateObj = new Date(year, month - 1, day);
  const today = new Date();
  const maxDate = new Date(2025, 11, 31);
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (inputDateObj < todayDateOnly || inputDateObj > maxDate) {
    await ctx.reply(
      "Помилка: Дата має бути в межах від сьогодні до 31.12.2025"
    );
    return ctx.scene.reenter();
  }

  ctx.session.data.date = inputDate;
  ctx.session.data.dateObj = inputDateObj;
  await ctx.reply(
    "Введіть кількість ночей, які бажаєте провести в готелі (1-30)",
    Markup.keyboard([["Назад"]])
      .resize()
      .oneTime()
  );
  return ctx.scene.enter("howManyNight");
});

export { pickDate };
