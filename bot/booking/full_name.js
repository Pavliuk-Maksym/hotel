import { Telegraf, Markup, Scenes } from "telegraf";

const fullName = new Scenes.BaseScene("fullName");

fullName.enter(async (ctx) => {
  await ctx.replyWithHTML(
    "Введіть ваші ПІБ за зразком — <code>Комаров Василій Дмитрович</code>",
    Markup.keyboard([["Назад"]])
      .resize()
      .oneTime()
  );
});

fullName.hears("Назад", async (ctx) => {
  await ctx.scene.enter("messenger");
});

fullName.on("text", async (ctx) => {
  const input = ctx.message.text.trim();
  
  // Проверяем, что введено не пустое значение
  if (!input || input.length < 5) {
    await ctx.reply(
      "❌ Помилка: ПІБ має містити мінімум 5 символів. Спробуйте ще раз.",
      Markup.keyboard([["Назад"]])
        .resize()
        .oneTime()
    );
    return;
  }
  
  // Требует три слова, каждое с большой буквы и не короче 2 букв
  const regex = /^([А-ЯІЇЄЁ][а-яіїєё']{1,}\s){2}[А-ЯІЇЄЁ][а-яіїєё']{1,}$/u;

  if (!regex.test(input)) {
    await ctx.reply(
      "❌ Неправильний формат ПІБ. Введіть три слова, кожне з великої літери. Наприклад: Комаров Василь Дмитрович. Спробуйте ще раз.",
      Markup.keyboard([["Назад"]])
        .resize()
        .oneTime()
    );
    return;
  }

  ctx.session.data.fullName = input;
  
  await ctx.reply(
    "✅ ПІБ успішно введено!",
    Markup.removeKeyboard()
  );
  
  return ctx.scene.enter("phone");
});

export { fullName };
