import { Telegraf, Markup, Scenes } from "telegraf";

const phone = new Scenes.BaseScene("phone");

phone.enter(async (ctx) => {
  await ctx.reply("📱 Введіть номер телефону у форматі +380123456789"); // Этот номер использую для тестов, заменить потом на +380XXXXXXXXX
});

phone.hears("Назад", async (ctx) => {
  return ctx.scene.enter("fullName");
});

phone.on("text", async (ctx) => {
  const input = ctx.message.text.trim();
  const regex = /^\+380\d{9}$/;

  if (!regex.test(input)) {
    await ctx.reply(
      "❌ Неправильний формат. Приклад: +380937465892. Спробуйте ще раз."
    );
    return;
  }

  const formatted = input.replace(
    /(\+380)(\d{2})(\d{3})(\d{2})(\d{2})/,
    "$1($2)-$3-$4-$5"
  );
  ctx.session.data.phoneNumber = formatted;

  return ctx.scene.enter("checkData");
});

export { phone };
