import { Telegraf, Scenes, session } from "telegraf";

// Импорт начального меню
import start from "../bot/start.js";

// Импорт сцен
import checkScene from "../bot/check.js";
import reservationScene from "../bot/reservation.js";
import ageCheckScene from "../bot/age_check.js";

// Импорт всех сцен, связанных с бронированием
import {
  pickDate,        // выбор даты
  checkDate,       // проверка выбранной даты
  setupMessengerScene, // диалог через мессенджер
  quantityNight,   // кол-во ночей
  howManyNight,    // подтверждение кол-ва ночей
  checkData,       // проверка всех данных перед подтверждением
  details,         // дополнительные детали
  paid,            // подтверждение оплаты
  phone,           // ввод телефона
  fullName,        // ввод полного имени
} from "../bot/booking/booking_exports.js";

// Главная функция для запуска бота
export async function launchBot() {
  const bot = new Telegraf(process.env.TOKEN_BOT); // Токен бота из .env

  const messengerScene = await setupMessengerScene(); // Получаем сцену диалога

  // Регистрируем все сцены
  const stage = new Scenes.Stage([
    checkScene,
    reservationScene,
    ageCheckScene,
    pickDate,
    checkDate,
    messengerScene,
    quantityNight,
    howManyNight,
    checkData,
    details,
    paid,
    phone,
    fullName,
  ]);

  bot.use(session());          // Используем сессии для хранения состояния сцен
  bot.use(stage.middleware()); // Подключаем middleware сцен

  // Настраиваем переход в сцену при выборе определённой команды
  bot.hears("Ввести дату", (ctx) => ctx.scene.enter("pickDate"));
  bot.hears("Порядок заселення", (ctx) => ctx.scene.enter("checkWizard"));
  bot.hears("Ваші бронювання", (ctx) => ctx.scene.enter("reservationWizard"));

  bot.use(start); // Показываем стартовое меню при первом запуске

  bot.launch();   // Запускаем бота
  console.log("🤖 Telegram bot started");

  // Обработка завершения работы
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
}
