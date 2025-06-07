import { Composer, Scenes } from "telegraf";
import Confirm from "../modules/confirmBooking.js";

const reservation = new Composer();

reservation.on("text", async (ctx) => {
  const userName = ctx.update.message.from.username;

  const confirms = await Confirm.find({ userName });

  if (confirms.length === 0) {
    await ctx.reply("Бронювання ще підтверджується або в вас немає бронювань");
    return ctx.scene.leave();
  }

  confirms.forEach(async (booking, index) => {
    await ctx.replyWithHTML(
      `<b>Бронь ${index + 1}</b>\n` +
        `<b>Дата бронювання:</b> ${booking.date}\n` +
        `<b>Номер:</b> ${booking.classRoom}\n` +
        `<b>ПБІ:</b> ${booking.fullName}\n` +
        `<b>Телефон:</b> ${booking.phoneNumber}\n`
    );
  });

  return ctx.scene.leave();
});

const reservationScene = new Scenes.WizardScene(
  "reservationWizard",
  reservation
);

export default reservationScene;
