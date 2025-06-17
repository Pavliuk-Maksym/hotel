// messenger.js
import { Scenes, Markup } from "telegraf";
import Room from "../../modules/rooms.js";
import Booking from "../../modules/booking.js";
import Confirm from "../../modules/confirmBooking.js";

function mergeIntervals(entries) {
  const intervals = entries.map((entry) => {
    const [d, m, y] = entry.date.split(":").map(Number);
    const start = new Date(y, m - 1, d);
    const end = new Date(start);
    end.setDate(start.getDate() + (entry.night || 1) + 2); // буфер +2 дня
    return [start, end];
  });

  intervals.sort((a, b) => a[0] - b[0]);

  const merged = [];
  for (const [start, end] of intervals) {
    if (!merged.length) {
      merged.push([start, end]);
    } else {
      const last = merged[merged.length - 1];
      if (start <= new Date(last[1].getTime() + 86400000)) {
        last[1] = new Date(Math.max(last[1], end));
      } else {
        merged.push([start, end]);
      }
    }
  }

  return merged;
}

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

  messenger.enter(async (ctx) => {
    const { hotelCity, dateObj, night } = ctx.session.data || {};

    if (!hotelCity || !dateObj || !night) {
      await ctx.reply("Дані для пошуку номеру неповні. Повернення назад.");
      return ctx.scene.enter("howManyNight");
    }

    const endDate = new Date(dateObj);
    endDate.setDate(endDate.getDate() + night);

    const formatDate = (d) => d.toLocaleDateString("uk-UA").replace(/\./g, ":");

    const allCityRooms = await Room.find({ hotelCity });

    const availableRooms = [];

    for (const room of allCityRooms) {
      const classRoom = room.classRoom;

      const [booked, confirmed] = await Promise.all([
        Booking.find({ classRoom }),
        Confirm.find({ classRoom }),
      ]);

      const allBookings = [...booked, ...confirmed];
      const merged = mergeIntervals(allBookings);

      let isBusy = false;
      let busyStart = null;
      let busyEnd = null;

      for (const [start, end] of merged) {
        if (start < endDate && end > new Date(dateObj)) {
          isBusy = true;
          if (!busyStart || start < busyStart) busyStart = start;
          if (!busyEnd || end > busyEnd) busyEnd = end;
        }
      }

      if (!isBusy) {
        availableRooms.push(classRoom);
      } else {
        const busyDays = Math.ceil(
          (busyEnd - busyStart) / (1000 * 60 * 60 * 24)
        );
        await ctx.reply(
          `Номери типу ${classRoom} зайняті з ${formatDate(
            busyStart
          )} до ${formatDate(busyEnd)} (${busyDays} днів)`
        );
      }
    }

    if (!availableRooms.length) {
      await ctx.reply(
        "На жаль, немає доступних номерів у цьому місті на вибрані дати."
      );
      return ctx.scene.enter("pickDate");
    }

    const buttons = availableRooms.map((type) =>
      Markup.button.callback(type, type)
    );

    await ctx.reply(
      "Оберіть доступний тип номеру:",
      Markup.inlineKeyboard(buttons, { columns: 1 })
    );
  });

  messenger.action(/.*/, async (ctx) => {
    const classRoom = ctx.match[0];
    await handleRoomAction(ctx, classRoom);
    await ctx.answerCbQuery();
  });

  messenger.hears("Назад", async (ctx) => {
    return ctx.scene.enter("pickHotel");
  });

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
