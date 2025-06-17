import { Markup, Scenes } from "telegraf";
import Room from "../../modules/rooms.js";

const pickHotel = new Scenes.BaseScene("pickHotel");

pickHotel.enter(async (ctx) => {
  const hotels = await Room.distinct("hotelCity");
  ctx.session.hotels = hotels; // сохранить в сессию

  const hotelButtons = hotels.map((hotel) => [hotel]);
  hotelButtons.push(["Назад"]);

  await ctx.reply(
    "Виберіть місто, в якому ви хочете забронювати готель:",
    Markup.keyboard(hotelButtons).resize().oneTime()
  );
});

pickHotel.hears("Назад", async (ctx) => {
  await ctx.reply(
    "Введіть кількість ночей, які бажаєте провести в готелі (1-30)"
  );
  return ctx.scene.enter("howManyNight"); // заміни на актуальну назву попередньої сцени
});

pickHotel.on("text", async (ctx) => {
  const selectedCity = ctx.message.text.trim();

  //   if (selectedCity === "Назад") {
  //     return ctx.scene.enter("previousScene"); // заміни на актуальну назву попередньої сцени
  //   }

  const hotels = ctx.session.hotels || [];

  if (!hotels.includes(selectedCity)) {
    await ctx.reply("Будь ласка, виберіть місто зі списку клавіатури.");
    return;
  }

  ctx.session.data = ctx.session.data || {};
  ctx.session.data.hotelCity = selectedCity;

  await ctx.reply(`Ви обрали місто: ${selectedCity}`);
  return ctx.scene.enter("messenger"); // або будь-яка наступна сцена
});

export { pickHotel };
