import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

import Admin from "../modules/administrations.js";
import Booking from "../modules/booking.js";
import Client from "../modules/clients.js";
import Confirm from "../modules/confirmBooking.js";

export function launchAdminPanel(bot) {
  const app = express();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const PORT = process.env.PORT || 3002;

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.set("views", path.join(__dirname, "../web/views"));
  app.set("view engine", "ejs");
  app.use(express.static(path.join(__dirname, "../web/views/activeBooking")));
  app.use(express.static(path.join(__dirname, "../web/views/confirmPayment")));
  app.use(express.static(path.join(__dirname, "../web/views/home")));
  app.use(express.static(path.join(__dirname, "../web/views/login")));
  app.use("/img", express.static(path.join(__dirname, "../img")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../web/views/login/index.html"));
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
    res.sendFile(path.join(__dirname, "../web/views/home/home.html"));
  });

  app.get("/confirmPayment", async (req, res) => {
    const bookings = await Booking.find({}).sort({ date: 1 });
    res.render("confirmPayment/confirm", { bookings });
  });

  app.post("/confirmPayment", async (req, res) => {
    try {
      const bookings = await Booking.find();
      res.render("confirmPayment/confirm", { bookings });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  app.post("/activeBooking", async (req, res) => {
    try {
      const client = await Client.find();
      res.render("activeBooking/active", { client });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  app.post("/declineBooking", async (req, res) => {
    const { userName, fullName, classRoom, adminComment } = req.body;
    if (!userName || !fullName || !classRoom || !adminComment) {
      return res.status(400).send("Не переданы все необходимые поля (userName, fullName, classRoom, adminComment)");
    }
    const booking = await Booking.findOne({ userName, fullName, classRoom });
    if (!booking) {
      return res.status(404).send("Бронь не найдена.");
    }
    await Booking.deleteOne({ _id: booking._id });
    // Отправляем уведомление пользователю в Telegram
    if (booking.userId && bot && bot.telegram) {
      try {
        await bot.telegram.sendMessage(
          booking.userId,
          `Ваша бронь отклонена.\nПричина: ${adminComment}`
        );
      } catch (e) {
        console.error("Ошибка отправки уведомления об отказе:", e);
      }
    }
    console.log("Отклонена бронь: userName=" + userName + ", fullName=" + fullName + ", classRoom=" + classRoom + ", причина: " + adminComment);
    res.redirect("/confirmPayment");
  });

  app.post("/confirmBooking", async (req, res) => {
    const { userName, date, time, beforeDate, classRoom, night, price, phoneNumber, fullName } = req.body;
    if (!userName || !date || !time || !beforeDate || !classRoom || !night || !price || !phoneNumber || !fullName) {
      return res.status(400).send("Не переданы все необходимые поля (userName, date, time, beforeDate, classRoom, night, price, phoneNumber, fullName)");
    }
    const booking = await Booking.findOne({ userName, fullName, classRoom });
    if (!booking) {
      return res.status(404).send("Бронь не найдена.");
    }
    await Booking.deleteOne({ _id: booking._id });
    const confirm = new Confirm({ userName, date, time, beforeDate, classRoom, night, price, phoneNumber, fullName });
    await confirm.save();
    // Отправляем уведомление пользователю в Telegram
    if (booking.userId && bot && bot.telegram) {
      try {
        await bot.telegram.sendMessage(
          booking.userId,
          `Ваша бронь подтверждена!\nНомер: ${classRoom}\nДата: ${date}\nПІБ: ${fullName}`
        );
      } catch (e) {
        console.error("Ошибка отправки уведомления о подтверждении:", e);
      }
    }
    console.log("Подтверждена бронь: userName=" + userName + ", fullName=" + fullName + ", classRoom=" + classRoom + ", номер брони: " + confirm._id);
    res.redirect("/confirmPayment");
  });

  app.listen(PORT, () => {
    console.log(`🌐 Admin panel started on port ${PORT}`);
  });
}
