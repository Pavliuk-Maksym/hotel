import { Markup, Scenes } from "telegraf";
import Room from "../../modules/rooms.js";
import Booking from "../../modules/booking.js";

/**
 * Обработчик действий при выборе типа комнаты
 */
async function handleRoomAction(ctx, classRoom) {
  const count = await Booking.countDocuments({
    classRoom,
    date: ctx.session.data.date,
  });

  const rooms = await Room.find();
  const totalRooms = rooms.reduce((sum, room) => sum + room.quantity, 0);
  const available = totalRooms - count;

  if (available <= 0) {
    await ctx.reply(
      `На жаль, на обрану вами дату немає вільних номерів класу "${classRoom}", поверніться до списку та оберіть інший із запропонованих`
    );
    return ctx.scene.enter("checkDate");
  }

  const room = await Room.findOne({ classRoom });

  if (!room || !room.image) {
    await ctx.reply("Room not found");
    return;
  }

  for (const image of room.image) {
    await ctx.replyWithPhoto({ source: image });
  }

  const roomDescriptions = {};
  for (const r of rooms) {
    roomDescriptions[r.classRoom] = r.description;
  }

  await ctx.replyWithHTML(roomDescriptions[classRoom]);
  ctx.session.data.classRoom = classRoom;

  await ctx.reply(
    "Виберіть Бронювати чи вернутись",
    Markup.keyboard([["Бронювати", "Назад"]])
      .oneTime()
      .resize()
  );

  return ctx.scene.enter("quantityNight");
}

/**
 * Асинхронно создаёт и возвращает сцену messenger
 */
export async function setupMessengerScene() {
  const roomTypes = await Room.distinct("classRoom");
  const messenger = new Scenes.BaseScene("messenger");

  roomTypes.forEach((classRoom) => {
    messenger.action(classRoom, (ctx) => handleRoomAction(ctx, classRoom));
  });

  return messenger;
}
