import { Telegraf, Composer, Scenes } from "telegraf";
import Confirm from "../modules/confirmBooking.js";

const reservation = new Composer();
reservation.on("text", async (ctx) => {
  const user = ctx.update.message.from;
  const userName = user.username;
  const count = await Confirm.countDocuments({ userName: userName });

  if (count > 0) {
    // думаю тут можно сделать поиск по айди и записать все в файлы в масив. а потом через фор их все показать(условно user.date[i])
    for (let i = 1; count >= i; ) {
      const confirm = await Confirm.find({ userName: userName });
      for (const user of confirm) {
        await ctx.replyWithHTML(
          `<b>Бронь ${i}</b>\n<b>Дата бронювання:</b> ${user.date}\n<b>Номер:</b> ${user.classRoom}\n<b>ПБІ:</b> ${user.fullName}\n<b>Телефон:</b> ${user.phoneNumber}\n`
        );
        i++;
      }
    }
  } else {
    await ctx.reply("Бронювання ще підтверджується або в вас немає бронювань");
    return ctx.scene.leave();
  }
  return ctx.scene.leave();
});
const reservationScene = new Scenes.WizardScene(
  "reservationWizard",
  reservation
);

export default reservationScene;
