import { Telegraf, Markup, Scenes } from "telegraf";
import { isValidFullName } from "./validation.js";

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
  
  // Проверяем через централизованную функцию
  if (!isValidFullName(input)) {
    await ctx.reply(
      "❌ Неправильний формат ПІБ. Введіть три слова, кожне з великої літери українською. Наприклад: Комаров Василь Дмитрович. Спробуйте ще раз.",
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
