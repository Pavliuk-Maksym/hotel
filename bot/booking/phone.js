import { Telegraf, Markup, Scenes } from "telegraf";

// Створюємо нову сцену для введення номера телефону
const phone = new Scenes.BaseScene("phone");

// При вході в сцену відправляємо користувачу інструкцію
phone.enter(async (ctx) => {
  await ctx.replyWithHTML(
    "📱 Введіть номер телефону у форматі <code>+380123456789</code>",
    Markup.keyboard([["Назад"]])
      .resize()
      .oneTime()
  );
  // Це повідомлення-інструкція. Нагадує користувачу, як правильно ввести номер.
  // Можна пізніше замінити приклад на реальний шаблон: +380XXXXXXXXX
});

// Обробка натискання кнопки "Назад" — повернення до сцени з введенням імені
phone.hears("Назад", async (ctx) => {
  return ctx.scene.enter("fullName"); // Повернення до попередньої сцени (введення ПІБ)
});

// Обробка будь-якого тексту (передбачається, що користувач вводить номер)
phone.on("text", async (ctx) => {
  const input = ctx.message.text.trim(); // Видаляємо зайві пробіли
  const regex = /^\+380\d{9}$/; // Перевірка на український номер: +380 і 9 цифр

  // Якщо номер введено неправильно — виводимо повідомлення про помилку
  if (!regex.test(input)) {
    await ctx.reply(
      "❌ Неправильний формат номера телефону. Приклад: +380937465892. Спробуйте ще раз.",
      Markup.keyboard([["Назад"]])
        .resize()
        .oneTime()
    );
    return;
  }

  // Якщо номер правильний — форматуємо для краси
  const formatted = input.replace(
    /(\+380)(\d{2})(\d{3})(\d{2})(\d{2})/,
    "$1($2)-$3-$4-$5" // Приклад: +380(93)-746-58-92
  );

  ctx.session.data.phoneNumber = formatted; // Зберігаємо в сесію

  await ctx.reply(
    "✅ Номер телефону успішно введений!",
    Markup.removeKeyboard()
  );

  return ctx.scene.enter("checkData"); // Перехід до наступної сцени — перевірка даних
});

export { phone };
