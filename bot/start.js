import { Telegraf, Markup } from "telegraf";

// Функция, которая запускается при старте бота
async function start(ctx) {
  // Переходим в сцену проверки возраста
  await ctx.scene.enter("ageCheck");
}

export default start;
