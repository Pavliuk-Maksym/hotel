import { Scenes, Markup } from "telegraf";
import Room from "../../modules/rooms.js";

async function handleRoomAction(ctx, classRoom) {
  ctx.session.data.classRoom = classRoom;

  const room = await Room.findOne({ classRoom });
  if (!room) {
    await ctx.reply("Не знайдено опису цього типу номеру");
    return;
  }

  if (room.image?.length) {
    for (const image of room.image) {
      await ctx.replyWithPhoto({ source: image });
    }
  }

  await ctx.replyWithHTML(room.description || "Опис відсутній");

  await ctx.reply(
    "Виберіть Бронювати чи Повернутись",
    Markup.keyboard([["Бронювати", "Назад"]])
      .oneTime()
      .resize()
  );
}

export async function setupMessengerScene() {
  const messenger = new Scenes.BaseScene("messenger");

  // Сцена при входе — показываем доступные номера для выбранного города
  messenger.enter(async (ctx) => {
    const selectedCity = ctx.session.data?.hotelCity;

    if (!selectedCity) {
      await ctx.reply("Місто не вибрано. Повернення назад.");
      return ctx.scene.enter("pickHotel");
    }

    // Получаем только номера в выбранном городе
    const roomOptions = await Room.find({ hotelCity: selectedCity });

    if (!roomOptions.length) {
      await ctx.reply("На жаль, у цьому місті немає доступних номерів.");
      return ctx.scene.enter("pickHotel");
    }

    // Создаем инлайн-кнопки для каждого типа номера
    const buttons = roomOptions.map((room) =>
      Markup.button.callback(room.classRoom, room.classRoom)
    );

    await ctx.reply(
      "Оберіть тип номеру:",
      Markup.inlineKeyboard(buttons, { columns: 1 })
    );
  });

  // Обработка нажатий на типы номеров
  messenger.action(/.*/, async (ctx) => {
    const classRoom = ctx.match[0];
    await handleRoomAction(ctx, classRoom);
    await ctx.answerCbQuery();
  });

  // Назад → к выбору города
  messenger.hears("Назад", async (ctx) => {
    return ctx.scene.enter("pickHotel");
  });

  // Переход к следующему шагу
  messenger.hears("Бронювати", async (ctx) => {
    const { classRoom } = ctx.session.data;
    if (!classRoom) {
      await ctx.reply("Будь ласка, спочатку виберіть тип номеру.");
      return;
    }
    return ctx.scene.enter("fullName");
  });

  return messenger;
}
