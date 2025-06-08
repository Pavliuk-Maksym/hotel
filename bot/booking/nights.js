import { Telegraf, Markup, Scenes } from "telegraf";

const quantityNight = new Scenes.BaseScene("quantityNight");

quantityNight.hears("Бронювати", async (ctx) => {
  await ctx.reply(
    "Введіть кількість ночей, які бажаєте провести в нашому готелі"
  );
  return ctx.scene.enter("howManyNight");
});

quantityNight.hears("Назад", async (ctx) => {
  return ctx.scene.enter("checkDate");
});

const howManyNight = new Scenes.BaseScene("howManyNight");

howManyNight.hears("Назад", async (ctx) => {
  return ctx.scene.enter("checkDate");
});

howManyNight.on("text", async (ctx) => {
  const nights = parseInt(ctx.message.text);
  if (isNaN(nights) || nights <= 0 || nights > 30) {
    await ctx.reply("Введіть коректну кількість ночей (від 1 до 30).");
    return;
  }
  ctx.session.data.night = nights;
  return ctx.scene.enter("fullName");
});

export { quantityNight, howManyNight };
