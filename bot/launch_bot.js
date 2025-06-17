import { Telegraf, Scenes, session } from "telegraf";

// Імпорт початкового меню
import start from "../bot/start.js";

// Імпорт сцен
import checkScene from "../bot/check.js";
import reservationScene from "../bot/reservation.js";
import ageCheckScene from "../bot/age_check.js";

// Імпорт всіх сцен, пов'язаних з бронюванням
import {
  pickDate, // вибір дати
  // checkDate,       // перевірка вибраної дати
  setupMessengerScene, // діалог через месенджер
  // quantityNight, // кількість ночей
  howManyNight, // підтвердження кількості ночей
  checkData, // перевірка всіх даних перед підтвердженням
  details, // додаткові деталі
  paid, // підтвердження оплати
  phone, // введення телефону
  fullName, // введення повного імені
} from "../bot/booking/booking_exports.js";

// Головна функція для запуску бота
export async function launchBot() {
  const bot = new Telegraf(process.env.TOKEN_BOT); // Токен бота з .env

  const messengerScene = await setupMessengerScene(); // Отримуємо сцену діалогу

  // Реєструємо всі сцени
  const stage = new Scenes.Stage([
    pickHotel,
    checkScene,
    reservationScene,
    ageCheckScene,
    pickDate,
    messengerScene,
    howManyNight,
    checkData,
    details,
    paid,
    phone,
    fullName,
  ]);

  bot.use(session()); // Використовуємо сесії для зберігання стану сцен
  bot.use(stage.middleware()); // Підключаємо middleware сцен

  // Налаштовуємо перехід в сцену при виборі певної команди
  bot.hears("Ввести дату", (ctx) => ctx.scene.enter("pickDate"));
  bot.hears("Порядок заселення", (ctx) => ctx.scene.enter("checkWizard"));
  bot.hears("Ваші бронювання", (ctx) => ctx.scene.enter("reservationWizard"));

  bot.use(start); // Показуємо стартове меню при першому запуску

  bot.launch(); // Запускаємо бота
  console.log("🤖 Telegram bot started");

  // Обробка завершення роботи
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
}
