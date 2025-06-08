import { Telegraf, Scenes, session } from "telegraf";
import start from "../bot/start.js";
import checkScene from "../bot/check.js";
import reservationScene from "../bot/reservation.js";

import {
  pickDate,
  checkDate,
  setupMessengerScene,
  quantityNight,
  howManyNight,
  checkData,
  details,
  paid,
  phone,
  fullName,
} from "../bot/booking/booking_exports.js";

export async function launchBot() {
  const bot = new Telegraf(process.env.TOKEN_BOT);

  const messenger = await setupMessengerScene();

  const stage = new Scenes.Stage([
    checkScene,
    reservationScene,
    pickDate,
    checkDate,
    messenger,
    quantityNight,
    howManyNight,
    fullName,
    phone,
    checkData,
    details,
    paid,
  ]);

  bot.use(session());
  bot.use(stage.middleware());

  bot.hears("Ввести дату", (ctx) => ctx.scene.enter("pickDate"));
  bot.hears("Порядок заселення", (ctx) => ctx.scene.enter("checkWizard"));
  bot.hears("Ваші бронювання", (ctx) => ctx.scene.enter("reservationWizard"));

  bot.use(start);

  bot.launch();
  console.log("🤖 Telegram bot started");

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
}
