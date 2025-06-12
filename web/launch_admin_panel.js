import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import Admin from "../modules/administrations.js";
import Booking from "../modules/booking.js";
import Client from "../modules/clients.js";
import Confirm from "../modules/confirmBooking.js";
import CancelRequest from "../modules/cancelRequest.js";

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

  // Создаём папку для стилей, если нет
  const cssDir = path.join(__dirname, "../public/css");
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }

  app.use('/css', express.static(cssDir));

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
      const client = await Confirm.find().sort({ date: 1 });
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
    const confirm = new Confirm({ userName, userId: booking.userId, date, time, beforeDate, classRoom, night, price, phoneNumber, fullName });
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

  // Страница заявок на отмену
  app.get("/cancelRequests", async (req, res) => {
    const requests = await CancelRequest.find({ status: "pending" }).sort({ createdAt: 1 });
    res.render("cancelRequests/cancel", { requests });
  });

  app.post("/cancelRequests", async (req, res) => {
    const requests = await CancelRequest.find({ status: "pending" }).sort({ createdAt: 1 });
    res.render("cancelRequests/cancel", { requests });
  });

  // Подтвердить отмену
  app.post("/confirmCancel", async (req, res) => {
    const { requestId } = req.body;
    const request = await CancelRequest.findById(requestId);
    if (!request) return res.status(404).send("Заявка не найдена");
    request.status = "confirmed";
    await request.save();
    // Удаляем бронь из Confirm
    await Confirm.deleteOne({ _id: request.bookingId });
    // Уведомляем пользователя
    if (request.userId && bot && bot.telegram) {
      try {
        await bot.telegram.sendMessage(
          request.userId,
          `Ваша заявка на отмену подтверждена!\nСумма возврата: ${request.refundAmount} грн (${request.refundPercentage}%)`
        );
      } catch (e) { console.error("Ошибка отправки уведомления об отмене:", e); }
    }
    res.redirect("/cancelRequests");
  });

  // Отклонить отмену
  app.post("/declineCancel", async (req, res) => {
    const { requestId, adminComment } = req.body;
    const request = await CancelRequest.findById(requestId);
    if (!request) return res.status(404).send("Заявка не найдена");
    request.status = "declined";
    request.adminComment = adminComment;
    await request.save();
    // Уведомляем пользователя
    if (request.userId && bot && bot.telegram) {
      try {
        await bot.telegram.sendMessage(
          request.userId,
          `Ваша заявка на отмену отклонена. Причина: ${adminComment}`
        );
      } catch (e) { console.error("Ошибка отправки уведомления об отказе отмены:", e); }
    }
    res.redirect("/cancelRequests");
  });

  app.listen(PORT, () => {
    console.log(`🌐 Admin panel started on port ${PORT}`);
  });
}
