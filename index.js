import * as dotenv from "dotenv";
dotenv.config();

import { Telegraf, Scenes, Markup, session } from "telegraf";
import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

import start from "./bot/start.js";
import checkScene from "./bot/check.js";
import reservationScene from "./bot/reservation.js";

import {
  pickDate,
  checkDate,
  messenger,
  quantityNight,
  howManyNight,
  checkData,
  details,
  paid,
  phone,
  fullName,
} from "./bot/booking/booking_exports.js";

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
  quantityNight,
  howManyNight,
  fullName,
  phone,
  checkData,
  details,
  paid,
]);

bot.use(session());
bot.use(stage.middleware());

// Хендлеры для команд и переходов по сценам
bot.hears("Ввести дату", (ctx) => ctx.scene.enter("pickDate"));
bot.hears("Порядок заселення", (ctx) => ctx.scene.enter("checkWizard"));
bot.hears("Ваші бронювання", (ctx) => ctx.scene.enter("reservationWizard"));

bot.use(start);

bot.launch().then(() => console.log("Started"));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// Express сервер

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");

// Статические файлы — желательно указать один корневой, а в нём — папки, но пока как у тебя:
app.use(
  express.static(path.join(__dirname, "website", "views", "activeBooking"))
);
app.use(
  express.static(path.join(__dirname, "website", "views", "confirmPayment"))
);
app.use(express.static(path.join(__dirname, "website", "views", "home")));
app.use(express.static(path.join(__dirname, "website", "views", "login")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "website", "views", "login", "index.html"));
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Admin.findOne({ username, password });
    if (user) {
      res.redirect("/home");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "website", "views", "home", "home.html"));
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
    res.status(500).send("Server error");
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
    res.status(500).send("Server error");
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
    res.status(500).send("Server error");
  }
});

app.post("/confirmBooking", async (req, res) => {
  try {
    const {
      userName,
      date,
      time,
      beforeDate,
      classRoom,
      night,
      price,
      phoneNumber,
      fullName,
    } = req.body;

    const newClient = new Client({
      userName,
      fullName,
      phoneNumber,
      classRoom,
    });
    await newClient.save();

    const newConfirm = new Confirm({
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
    await newConfirm.save();

    const userBooking = await Booking.findOne({ userName });
    if (userBooking) {
      const userId = userBooking.userId;
      await bot.telegram.sendMessage(
        userId,
        `Бронювання підтверджено на ім'я: ${fullName}, Номер: ${classRoom}`
      );

      await Booking.deleteOne({
        userName,
        date,
        time,
        classRoom,
        night,
        price,
        phoneNumber,
        fullName,
      });
    }

    res.redirect("/confirmPayment");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
