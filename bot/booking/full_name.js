import { Telegraf, Markup, Scenes } from "telegraf";

const fullName = new Scenes.BaseScene("fullName");

fullName.enter(async (ctx) => {
  await ctx.reply("Введіть ваші ПІБ за зразком — Комаров Василій Дмитрович");
});

fullName.hears("Назад", async (ctx) => {
  await ctx.reply(
    "Введіть кількість ночей, які бажаєте провести в нашому готелі"
  );

  return ctx.scene.enter("howManyNight");
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

export { fullName };
