import { Telegraf, Markup } from "telegraf";

// Функція, яка запускається при старті бота
async function start(ctx) {
  // Переходимо в сцену перевірки віку
  await ctx.scene.enter("ageCheck");
}

export default start;
// qwedw