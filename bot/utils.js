import Booking from "../modules/booking.js";
import Room from "../modules/rooms.js";

export function parseDate(input) {
  const regex = /^(\d{2}):(\d{2}):(\d{4})$/;
  if (!regex.test(input)) return null;

  const [day, month, year] = input.split(":").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return null;

  return date;
}

export function validateFullName(name) {
  const regex = /^([a-zA-Zа-яА-ЯёЁіІїЇєЄ']+(\s|$)){2}[a-zA-Zа-яА-ЯёЁіІїЇєЄ']+$/;
  return regex.test(name.trim());
}

export function validatePhone(phone) {
  const regex = /^\+380?\d{9}$/;
  return regex.test(phone.trim());
}

export async function getRemainingRooms(classRoom, date) {
  const count = await Booking.countDocuments({ classRoom, date });
  const room = await Room.findOne({ classRoom });

  if (!room || typeof room.quantity !== "number") return 0;

  return room.quantity - count;
}

export async function handleRoomSelection(ctx, classRoom, description) {
  const date = ctx.session.data.date;
  const remaining = await getRemainingRooms(classRoom, date);

  if (remaining <= 0) {
    await ctx.reply(
      "На жаль, на обрану вами дату немає вільних номерів, поверніться до списку та оберіть інший із запропонованих"
    );
    return ctx.scene.enter("checkDate");
  }

  const room = await Room.findOne({ classRoom });
  if (!room || !room.image || room.image.length === 0) {
    await ctx.reply("Вибачте, інформація про номер недоступна");
    return;
  }

  for (const image of room.image) {
    await ctx.replyWithPhoto({ source: image });
  }
  await ctx.replyWithHTML(description);

  ctx.session.data.classRoom = classRoom;

  await ctx.reply(
    "Виберіть Бронювати чи вернутись",
    Markup.keyboard([["Бронювати", "Назад"]])
      .oneTime()
      .resize()
  );
  return ctx.scene.enter("backOrQuantityNight");
}

// export async function handleRoomAction(ctx, classRoom) {
//   const count = await Booking.countDocuments({
//     classRoom,
//     date: ctx.session.data.date,
//   });

//   const total_rooms = await Room.countDocuments({ classRoom });

//   const available = total_rooms - count;

//   if (available <= 0) {
//     await ctx.reply(
//       "На жаль, на обрану вами дату немає вільних номерів, поверніться до списку та оберіть інший із запропонованих"
//     );
//     return ctx.scene.enter("pickDate");
//   }

//   const room = await Room.findOne({ classRoom });

//   if (!room || !room.image) {
//     await ctx.reply("Room not found");
//     return;
//   }

//   for (const image of room.image) {
//     await ctx.replyWithPhoto({ source: image });
//   }

//   await ctx.replyWithHTML(roomDescriptions[classRoom]);
//   ctx.session.data.classRoom = classRoom;

//   await ctx.reply(
//     "Виберіть Бронювати чи вернутись",
//     Markup.keyboard([["Бронювати", "Назад"]])
//       .oneTime()
//       .resize()
//   );

//   return ctx.scene.enter("backOrQuantityNight");
// }
