import { Markup, Scenes } from "telegraf";

const howManyNight = new Scenes.BaseScene("howManyNight");

howManyNight.enter(async (ctx) => {
  await ctx.reply(
    "Введіть кількість ночей, які бажаєте провести в готелі (1-30)",
    Markup.keyboard([["Назад"]])
      .resize()
      .oneTime()
  );
});

howManyNight.hears("Назад", async (ctx) => {
  return ctx.scene.enter("pickDate");
});

howManyNight.on("text", async (ctx) => {
  const input = ctx.message.text.trim();
  const nights = parseInt(input);
  
  if (isNaN(nights)) {
    await ctx.reply(
      "❌ Помилка: Введіть число від 1 до 30. Спробуйте ще раз.",
      Markup.keyboard([["Назад"]])
        .resize()
        .oneTime()
    );
    return;
  }
  
  if (nights < 1 || nights > 30) {
    await ctx.reply(
      "❌ Помилка: Кількість ночей має бути від 1 до 30. Спробуйте ще раз.",
      Markup.keyboard([["Назад"]])
        .resize()
        .oneTime()
    );
    return;
  }

  ctx.session.data = ctx.session.data || {};
  ctx.session.data.night = nights;

  await ctx.reply(
    "✅ Кількість ночей успішно введена!",
    Markup.removeKeyboard()
  );
  
  await ctx.reply("Тепер виберіть місто, в якому бажаєте зупинитись.");
  return ctx.scene.enter("pickHotel");
});

export { howManyNight };
