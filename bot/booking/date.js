import { Markup, Scenes } from "telegraf";

const pickDate = new Scenes.BaseScene("pickDate");

pickDate.enter(async (ctx) => {
  ctx.session.data = {};

  const now = new Date();
  const formattedDate = now.toLocaleDateString("uk-UA").replace(/\./g, ":");

  await ctx.replyWithHTML(
    `Введіть дату в форматі ДД:ММ:РРРР (наприклад <code>${formattedDate}</code>)`,
    Markup.keyboard([["Назад"]])
      .resize()
      .oneTime()
  );
});

pickDate.hears("Назад", async (ctx) => {
  // Возвращаем в главное меню
  await ctx.reply(
    "Виберіть, що вас цікавить",
    Markup.keyboard([["Ввести дату"], ["Порядок заселення", "Ваші бронювання"]])
      .oneTime()
      .resize()
  );
  return ctx.scene.leave();
});

pickDate.on("text", async (ctx) => {
  const inputDate = ctx.message.text.trim();
  const regex = /^(\d{2}):(\d{2}):(\d{4})$/;

  if (!regex.test(inputDate)) {
    await ctx.reply(
      "❌ Помилка: Некоректний формат дати. Спробуйте ще раз.",
      Markup.keyboard([["Назад"]])
        .resize()
        .oneTime()
    );
    return; // Просто возвращаемся, не переходим к другой сцене
  }

  const [day, month, year] = inputDate.split(":").map(Number);
  
  // Проверяем корректность даты
  const inputDateObj = new Date(year, month - 1, day);
  
  // Проверяем, что введенная дата соответствует введенным числам
  if (inputDateObj.getDate() !== day || 
      inputDateObj.getMonth() !== month - 1 || 
      inputDateObj.getFullYear() !== year) {
    await ctx.reply(
      "❌ Помилка: Некорректна дата (наприклад, 31.02.2024 не існує). Спробуйте ще раз.",
      Markup.keyboard([["Назад"]])
        .resize()
        .oneTime()
    );
    return;
  }
  
  const today = new Date();
  const maxDate = new Date(2025, 11, 31);
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  if (inputDateObj < todayDateOnly || inputDateObj > maxDate) {
    await ctx.reply(
      "❌ Помилка: Дата має бути в межах від сьогодні до 31.12.2025. Спробуйте ще раз.",
      Markup.keyboard([["Назад"]])
        .resize()
        .oneTime()
    );
    return; // Просто возвращаемся, не переходим к другой сцене
  }

  ctx.session.data.date = inputDate;
  ctx.session.data.dateObj = inputDateObj;
  
  await ctx.reply(
    "✅ Дата успішно введена!",
    Markup.removeKeyboard()
  );
  
  return ctx.scene.enter("howManyNight");
});

export { pickDate };
