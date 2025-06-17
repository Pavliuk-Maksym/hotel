import { Telegraf, Markup, Scenes } from "telegraf";

// Создаём новую сцену для ввода номера телефона
const phone = new Scenes.BaseScene("phone");

// При входе в сцену отправляем пользователю инструкцию
phone.enter(async (ctx) => {
  await ctx.replyWithHTML(
    "📱 Введіть номер телефону у форматі <code>+380123456789</code>",
    Markup.keyboard([["Назад"]])
      .resize()
      .oneTime()
  );
  // Это сообщение-инструкция. Напоминает пользователю, как правильно ввести номер.
  // Можно позже заменить пример на реальный шаблон: +380XXXXXXXXX
});

// Обработка нажатия кнопки "Назад" — возврат к сцене с вводом имени
phone.hears("Назад", async (ctx) => {
  return ctx.scene.enter("fullName"); // Возврат к предыдущей сцене (ввод ФИО)
});

// Обработка любого текста (предполагается, что пользователь вводит номер)
phone.on("text", async (ctx) => {
  const input = ctx.message.text.trim(); // Удаляем лишние пробелы
  const regex = /^\+380\d{9}$/; // Проверка на украинский номер: +380 и 9 цифр

  // Если номер введён неправильно — выводим сообщение об ошибке
  if (!regex.test(input)) {
    await ctx.reply(
      "❌ Неправильний формат. Приклад: +380937465892. Спробуйте ще раз."
    );
    return;
  }

  // Если номер правильный — форматируем для красоты
  const formatted = input.replace(
    /(\+380)(\d{2})(\d{3})(\d{2})(\d{2})/,
    "$1($2)-$3-$4-$5" // Пример: +380(93)-746-58-92
  );

  ctx.session.data.phoneNumber = formatted; // Сохраняем в сессию

  return ctx.scene.enter("checkData"); // Переход к следующей сцене — проверка данных
});

export { phone };
