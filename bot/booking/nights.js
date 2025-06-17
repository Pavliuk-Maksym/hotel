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
  const nights = parseInt(ctx.message.text.trim());
  if (isNaN(nights) || nights < 1 || nights > 30) {
    await ctx.reply("Будь ласка, введіть число від 1 до 30.");
    return;
  }

  ctx.session.data = ctx.session.data || {};
  ctx.session.data.night = nights;

  await ctx.reply("Тепер виберіть місто, в якому бажаєте зупинитись.");
  return ctx.scene.enter("pickHotel");
});

export { howManyNight };
