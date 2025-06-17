import { Scenes, Markup } from "telegraf";

// Створюємо сцену перевірки віку
const ageCheckScene = new Scenes.BaseScene("ageCheck");

// Обробник входу в сцену
ageCheckScene.enter(async (ctx) => {
  await ctx.reply(
    "Для використання бота необхідно підтвердити, що вам виповнилося 18 років. Ви підтверджуєте?",
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Так, мені 18 або більше", "age_confirm_yes"),
        Markup.button.callback("Ні, мені менше 18", "age_confirm_no"),
      ],
    ])
  );
});

// Обробник натискання кнопки "Так"
ageCheckScene.action("age_confirm_yes", async (ctx) => {
  await ctx.deleteMessage(); // Видаляємо повідомлення з кнопками
  await ctx.reply("Дякуємо за підтвердження! Ласкаво просимо в меню бота.");
  await ctx.scene.leave();
  // Показуємо основне меню
  await ctx.reply(
    "Виберіть, що вас цікавить",
    Markup.keyboard([["Ввести дату"], ["Порядок заселення", "Ваші бронювання"]])
      .oneTime()
      .resize()
  );
});

// Обробник натискання кнопки "Ні"
ageCheckScene.action("age_confirm_no", async (ctx) => {
  await ctx.deleteMessage(); // Видаляємо повідомлення з кнопками
  await ctx.reply("На жаль, ви не можете використовувати бота, оскільки вам менше 18 років.");
  await ctx.scene.leave();
});

export default ageCheckScene; 