import { Telegraf, Markup, Scenes } from "telegraf";

const fullName = new Scenes.BaseScene("fullName");

fullName.enter(async (ctx) => {
  await ctx.reply(
    "Введіть ваші ПІБ за зразком — Комаров Василій Дмитрович",
    Markup.keyboard([["Назад"]])
      .resize()
      .oneTime()
  );
});

fullName.hears("Назад", async (ctx) => {
  await ctx.enter("messenger");
});

fullName.on("text", async (ctx) => {
  const input = ctx.message.text.trim();
  // Требует три слова, каждое с большой буквы и не короче 2 букв
  const regex = /^([А-ЯІЇЄЁ][а-яіїєё']{1,}\s){2}[А-ЯІЇЄЁ][а-яіїєё']{1,}$/u;

  if (!regex.test(input)) {
    await ctx.reply(
      "❌ Неправильний формат ПІБ. Спробуйте ще раз. (Наприклад: Комаров Василь Дмитрович)"
    );
    return;
  }

  ctx.session.data.fullName = input;
  return ctx.scene.enter("phone");
});

export { fullName };
