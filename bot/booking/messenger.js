// messenger.js
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
    "Виберіть Бронювати чи вернутись",
    Markup.keyboard([["Бронювати", "Назад"]])
      .oneTime()
      .resize()
  );
}

export async function setupMessengerScene() {
  const roomTypes = await Room.distinct("classRoom");
  const messenger = new Scenes.BaseScene("messenger");

  roomTypes.forEach((classRoom) => {
    messenger.action(classRoom, (ctx) => handleRoomAction(ctx, classRoom));
  });

  messenger.hears("Назад", async (ctx) => {
    await ctx.reply(
      "Введіть кількість ночей, які бажаєте провести в готелі (1-30)"
    );
    await ctx.scene.enter("howManyNight");
  });

  messenger.hears("Бронювати", async (ctx) => {
    const { classRoom } = ctx.session.data;
    if (!classRoom) {
      await ctx.reply("Будь ласка, спочатку виберіть номер.");
      return;
    }
    return ctx.scene.enter("fullName");
  });

  return messenger;
}
