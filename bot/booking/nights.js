// night.js
import { Scenes, Markup } from "telegraf";
import Room from "../../modules/rooms.js";
import Booking from "../../modules/booking.js";
import Confirm from "../../modules/confirmBooking.js";

const howManyNight = new Scenes.BaseScene("howManyNight");

// utils/mergeIntervals.js

function mergeIntervals(entries) {
  const intervals = entries.map((entry) => {
    const [d, m, y] = entry.date.split(":").map(Number);
    const start = new Date(y, m - 1, d);
    const end = new Date(start);
    end.setDate(start.getDate() + (entry.night || 1));
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

howManyNight.hears("Назад", async (ctx) => {
  await ctx.reply("Введіть дату заселення знову:");
  return ctx.scene.enter("pickDate");
});

howManyNight.on("text", async (ctx) => {
  const nights = parseInt(ctx.message.text.trim());
  if (isNaN(nights) || nights < 1 || nights > 30) {
    await ctx.reply("Будь ласка, введіть число від 1 до 30.");
    return;
  }

  ctx.session.data.night = nights;

  const { dateObj } = ctx.session.data;
  const endDate = new Date(dateObj);
  endDate.setDate(endDate.getDate() + nights);

  const formatDate = (d) => d.toLocaleDateString("uk-UA").replace(/\./g, ":");

  const roomTypes = await Room.find({});
  const buttons = [];

  for (const room of roomTypes) {
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
      if (start < endDate && end > dateObj) {
        isBusy = true;
        if (!busyStart || start < busyStart) busyStart = start;
        if (!busyEnd || end > busyEnd) busyEnd = end;
      }
    }

    if (!isBusy) {
      buttons.push([Markup.button.callback(classRoom, classRoom)]);
    } else {
      const busyDays = Math.ceil((busyEnd - busyStart) / (1000 * 60 * 60 * 24));
      await ctx.reply(
        `Номери типу ${classRoom} зайняті з ${formatDate(
          busyStart
        )} до ${formatDate(busyEnd)} (${busyDays} днів)`
      );
    }
  }

  if (buttons.length === 0) {
    await ctx.reply("На жаль, всі типи номерів зайняті на обраний період.");
    return ctx.scene.enter("pickDate");
  }

  await ctx.reply(
    "Оберіть доступний тип номеру:",
    Markup.inlineKeyboard(buttons)
  );

  return ctx.scene.enter("messenger");
});

export { howManyNight };
