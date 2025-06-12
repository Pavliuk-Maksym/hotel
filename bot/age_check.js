import { Scenes, Markup } from "telegraf";

// Создаем сцену проверки возраста
const ageCheckScene = new Scenes.BaseScene("ageCheck");

// Обработчик входа в сцену
ageCheckScene.enter(async (ctx) => {
  await ctx.reply(
    "Для использования бота необходимо подтвердить, что вам исполнилось 18 лет. Вы подтверждаете?",
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Да, мне 18 или больше", "age_confirm_yes"),
        Markup.button.callback("Нет, мне меньше 18", "age_confirm_no"),
      ],
    ])
  );
});

// Обработчик нажатия кнопки "Да"
ageCheckScene.action("age_confirm_yes", async (ctx) => {
  await ctx.deleteMessage(); // Удаляем сообщение с кнопками
  await ctx.reply("Спасибо за подтверждение! Добро пожаловать в меню бота.");
  await ctx.scene.leave();
  // Показываем основное меню
  await ctx.reply(
    "Виберіть, що вас цікавить",
    Markup.keyboard([["Ввести дату"], ["Порядок заселення", "Ваші бронювання"]])
      .oneTime()
      .resize()
  );
});

// Обработчик нажатия кнопки "Нет"
ageCheckScene.action("age_confirm_no", async (ctx) => {
  await ctx.deleteMessage(); // Удаляем сообщение с кнопками
  await ctx.reply("К сожалению, вы не можете использовать бота, так как вам меньше 18 лет.");
  await ctx.scene.leave();
});

export default ageCheckScene; 