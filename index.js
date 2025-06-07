import * as dotenv from "dotenv";
dotenv.config();

import { Telegraf, Composer, Scenes, Markup, session } from "telegraf";
import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

import start from "./tg_bot/start.js";
import checkScene from "./tg_bot/check.js";
import reservationScene from "./tg_bot/reservation.js";
import {
  pickDate,
  checkDate,
  messenger,
  backOrQuantityNight,
  howManyNight,
  fullName,
  checkFullName,
  phone,
  checkPhone,
  checkData,
  details,
  paid,
} from "./tg_bot/chooseDate.js";

import Admin from "./modules/administration.js";
import Booking from "./modules/booking.js";
import Client from "./modules/clients.js";
import Confirm from "./modules/confirmBooking.js";

const bot = new Telegraf(process.env.TOKEN_BOT);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3002;
await mongoose
  .connect(process.env.URL_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connect to MongoDB"))
  .catch((err) => console.log(`DB connection error: ${err}`));

const stage = new Scenes.Stage([
  checkScene,
  reservationScene,
  pickDate,
  checkDate,
  messenger,
  backOrQuantityNight,
  howManyNight,
  fullName,
  checkFullName,
  phone,
  checkPhone,
  checkData,
  details,
  paid,
]);
bot.use(session());
bot.use(stage.middleware());

bot.hears("Ввести дату", (ctx) => ctx.scene.enter("pickDate"));
bot.hears("Порядок заселення", (ctx) => ctx.scene.enter("checkWizard"));
bot.hears("Ваші бронювання", (ctx) => ctx.scene.enter("reservationWizard"));

bot.use(start);

bot.launch().then(() => console.log("Started"));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

//back website

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/website/views/activeBooking"));
app.use(express.static(__dirname + "/website/views/confirmPayment"));
app.use(express.static(__dirname + "/website/views/home"));
app.use(express.static(__dirname + "/website/views/login"));

app.get("/", (req, res) => {
  try {
    res.sendFile(
      path.join(__dirname, "website", "views", "login", "index.html")
    );
  } catch (err) {
    console.error(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    async function getUser() {
      const user = await Admin.findOne({ username, password });
      console.log(user);
      if (user) {
        res.redirect("/home");
      } else {
        res.redirect("/");
      }
    }
    await getUser();
  } catch (err) {
    console.error(err);
  }
});

app.get("/home", async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "website", "views", "home", "home.html"));
  } catch (err) {
    console.error(err);
  }
});

app.post("/confirmPayment", async (req, res) => {
  try {
    const booking = await Booking.find();
    res.render(
      path.join(__dirname, "website", "views", "confirmPayment", "confirm.ejs"),
      {
        booking,
      }
    );
  } catch (err) {
    console.error(err);
  }
});

app.get("/confirmPayment", async (req, res) => {
  try {
    const booking = await Booking.find();
    res.render(
      path.join(__dirname, "website", "views", "confirmPayment", "confirm.ejs"),
      {
        booking,
      }
    );
  } catch (err) {
    console.error(err);
  }
});

app.post("/activeBooking", async (req, res) => {
  try {
    const client = await Client.find();
    res.render(
      path.join(__dirname, "website", "views", "activeBooking", "active.ejs"),
      {
        client,
      }
    );
  } catch (err) {
    console.error(err);
  }
});

app.post("/confirmBooking", async (req, res) => {
  const userName = req.body.userName;
  const date = req.body.date;
  const time = req.body.time;
  const beforeDate = req.body.beforeDate;
  const classRoom = req.body.classRoom;
  const night = req.body.night;
  const price = req.body.price;
  const phoneNumber = req.body.phoneNumber;
  const fullName = req.body.fullName;

  const newClient = await new Client({
    userName,
    fullName,
    phoneNumber,
    classRoom,
  });

  try {
    await newClient.save().then(() => console.log("done save"));
  } catch (err) {
    console.error("DB save error:", err);
  }

  const newConfirm = await new Confirm({
    userName,
    date,
    time,
    beforeDate,
    classRoom,
    night,
    price,
    phoneNumber,
    fullName,
  });

  try {
    await newConfirm.save().then(() => console.log("done save"));
  } catch (err) {
    console.error("DB save error:", err);
  }

  const user = await Booking.findOne({ userName });
  const userId = user.userId;
  try {
    await bot.telegram.sendMessage(
      userId,
      `Бронювання підтверджено на ім'я: ${fullName}, Номер: ${classRoom}`
    );
    console.log("Message sent");
  } catch (error) {
    console.error("Error sending message:", error);
  }

  try {
    await Booking.deleteOne({
      userName: userName,
      date: date,
      time: time,
      classRoom: classRoom,
      night: night,
      price: price,
      phoneNumber: phoneNumber,
      fullName: fullName,
    });
  } catch (err) {
    console.error(err);
  }

  try {
    res.redirect("/confirmPayment");
  } catch (err) {
    console.error(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server started in port - ${PORT}`);
});
