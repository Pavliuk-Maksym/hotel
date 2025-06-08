import { Telegraf, Markup, Scenes } from "telegraf";

import Room from "../../modules/rooms.js";
import Booking from "../../modules/booking.js";
import Admin from "../../modules/administrations.js";

// const roomDescriptions = {
//   Економ: `<b>Двокімнатний двомісний економ</b>
//   Просторий двокімнатний номер середньою площею 40 м². Складається з вітальні, спальні та ванної кімнати. У спальні – одне двоспальне ліжко, у вітальні – розкладний диван. На вимогу надається дитяче ліжечко.
//   Ціна: 1250 грн`,

//   Стандарт: `<b>Двокімнатний двомісний стандарт</b>
//   Просторий двокімнатний номер середньою площею 40 м². Складається з вітальні, спальні та ванної кімнати. У спальні – високоякісне ліжко king-size, у вітальні – розкладний диван. На вимогу надається дитяче ліжечко.
//   Ціна: 1450 грн`,

//   Напівлюкс: `<b>Однокімнатний одномісний напівлюкс</b>
//   Покращений однокімнатний номер середньою площею 19 м². Ідеально підходить для ділових людей, котрі подорожують з комфортом. В номері одне полуторне ліжко.
//   Ціна: 1700 грн`,

//   Люкс: `<b>Двомісний люкс «Класік»</b>
//   Розкішний двокімнатний номер або номер-студія середньою площею 60 м². Складається зі спальні, вітальні та ванної кімнати. У спальні – високоякісне ліжко king-size, у вітальні – розкладний диван. На вимогу надається дитяче ліжечко. Номер створений для найбільш вибагливих гостей.
//   Ціна: 2700 грн`,
// };

async function handleRoomAction(ctx, classRoom) {
  // Считаем количество занятых броней на выбранную дату
  const count = await Booking.countDocuments({
    classRoom,
    date: ctx.session.data.date,
  });

  const rooms = await Room.find(); // Получаем все записи
  const total_rooms = rooms.reduce((sum, room) => sum + room.quantity, 0);
  const available = total_rooms - count;

  if (available <= 0) {
    await ctx.reply(
      `На жаль, на обрану вами дату немає вільних номерів классу "${classRoom}", поверніться до списку та оберіть інший із запропонованих`
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
  for (const room of rooms) {
    roomDescriptions[room.classRoom] = room.description;
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

const messenger = new Scenes.BaseScene("messenger");

// const roomTypes = await Room.distinct("classRoom");
// Обработка для всех комнат через единый обработчик
["Економ", "Стандарт", "Напівлюкс", "Люкс"].forEach((classRoom) => {
  messenger.action(classRoom, (ctx) => handleRoomAction(ctx, classRoom));
});

export { messenger };
