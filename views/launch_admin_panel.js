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
  const projectRoot = path.resolve(__dirname, "..");
  const PORT = process.env.PORT || 3001;

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Set views directory
  app.set("views", path.join(projectRoot, "views"));
  app.set("view engine", "ejs");

  // Serve static files
  app.use(express.static(path.join(projectRoot, "views")));
  app.use("/img", express.static(path.join(projectRoot, "img")));
  app.use("/css", express.static(path.join(projectRoot, "public/css")));

  // Debug middleware to log static file requests
  app.use((req, res, next) => {
    console.log("Request URL:", req.url);
    next();
  });

  // Create CSS directory if it doesn't exist
  const cssDir = path.join(projectRoot, "css");
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }

  // Create default style.css if it doesn't exist
  const styleCssPath = path.join(cssDir, "style.css");
  if (!fs.existsSync(styleCssPath)) {
    const defaultCss = `
      body {
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: #f0f2f5;
        font-family: Arial, sans-serif;
      }
      .modal {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
      }
      h1 {
        text-align: center;
        color: #1a73e8;
        margin-bottom: 1.5rem;
      }
      input {
        width: 100%;
        padding: 0.8rem;
        margin: 0.5rem 0;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
      }
      button {
        width: 100%;
        padding: 0.8rem;
        background: #1a73e8;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 1rem;
      }
      button:hover {
        background: #1557b0;
      }
    `;
    fs.writeFileSync(styleCssPath, defaultCss.trim());
  }

  app.get("/", (req, res) => {
    res.sendFile(path.join(projectRoot, "views/login/index.html"));
  });

  app.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await Admin.findOne({ username, password });
      if (user) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const client = (await Confirm.find().sort({ date: 1 })).filter(book => {
          if (!book.date) return false;
          const [d, m, y] = book.date.split(":").map(Number);
          const bookingDate = new Date(y, m - 1, d);
          bookingDate.setHours(0,0,0,0);
          return bookingDate >= today;
        });
        res.render("activeBooking/active", { client });
      } else {
        res.redirect("/");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  app.get("/confirmPayment", async (req, res) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const bookings = (await Booking.find({}).sort({ date: 1 })).filter(book => {
      if (!book.date) return false;
      const [d, m, y] = book.date.split(":").map(Number);
      const bookingDate = new Date(y, m - 1, d);
      bookingDate.setHours(0,0,0,0);
      return bookingDate >= today;
    });
    res.render("confirmPayment/confirm", { bookings });
  });

  app.post("/confirmPayment", async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0,0,0,0);
      const bookings = (await Booking.find()).filter(book => {
        if (!book.date) return false;
        const [d, m, y] = book.date.split(":").map(Number);
        const bookingDate = new Date(y, m - 1, d);
        bookingDate.setHours(0,0,0,0);
        return bookingDate >= today;
      });
      res.render("confirmPayment/confirm", { bookings });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  app.post("/activeBooking", async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0,0,0,0);
      const client = (await Confirm.find().sort({ date: 1 })).filter(book => {
        if (!book.date) return false;
        const [d, m, y] = book.date.split(":").map(Number);
        const bookingDate = new Date(y, m - 1, d);
        bookingDate.setHours(0,0,0,0);
        return bookingDate >= today;
      });
      res.render("activeBooking/active", { client });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  app.get("/activeBooking", async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0,0,0,0);
      const client = (await Confirm.find().sort({ date: 1 })).filter(book => {
        if (!book.date) return false;
        const [d, m, y] = book.date.split(":").map(Number);
        const bookingDate = new Date(y, m - 1, d);
        bookingDate.setHours(0,0,0,0);
        return bookingDate >= today;
      });
      res.render("activeBooking/active", { client });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });

  app.post("/declineBooking", async (req, res) => {
    const { userName, fullName, classRoom, adminComment } = req.body;
    if (!userName || !fullName || !classRoom || !adminComment) {
      return res
        .status(400)
        .send(
          "Не передано всі необхідні поля (userName, fullName, classRoom, adminComment)"
        );
    }
    const booking = await Booking.findOne({ userName, fullName, classRoom });
    if (!booking) {
      return res.status(404).send("Бронювання не знайдено.");
    }
    await Booking.deleteOne({ _id: booking._id });
    // Відправляємо повідомлення користувачу в Telegram
    if (booking.userId && bot && bot.telegram) {
      try {
        await bot.telegram.sendMessage(
          booking.userId,
          `Ваше бронювання відхилено.\nПричина: ${adminComment}`
        );
      } catch (e) {
        console.error("Помилка відправки повідомлення про відхилення:", e);
      }
    }
    console.log(
      "Відхилено бронювання: userName=" +
        userName +
        ", fullName=" +
        fullName +
        ", classRoom=" +
        classRoom +
        ", причина: " +
        adminComment
    );
    res.redirect("/confirmPayment");
  });

  app.post("/confirmBooking", async (req, res) => {
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
    if (
      !userName ||
      !date ||
      !time ||
      !beforeDate ||
      !classRoom ||
      !night ||
      !price ||
      !phoneNumber ||
      !fullName
    ) {
      return res
        .status(400)
        .send(
          "Не передані всі необхідні поля (userName, date, time, beforeDate, classRoom, night, price, phoneNumber, fullName)"
        );
    }
    const booking = await Booking.findOne({ userName, fullName, classRoom });
    if (!booking) {
      return res.status(404).send("Бронь не знайдена.");
    }
    await Booking.deleteOne({ _id: booking._id });
    const confirm = new Confirm({
      userName,
      userId: booking.userId,
      date,
      time,
      beforeDate,
      hotelCity: booking.hotelCity,
      classRoom,
      night,
      price,
      phoneNumber,
      fullName,
    });
    await confirm.save();
    // Відправляємо повідомлення користувачу в Telegram
    if (booking.userId && bot && bot.telegram) {
      try {
        await bot.telegram.sendMessage(
          booking.userId,
          `Ваша бронь підтверджена!\nНомер: ${classRoom}\nДата: ${date}\nПІБ: ${fullName}`
        );
      } catch (e) {
        console.error("Помилка відправки повідомлення про підтвердження:", e);
      }
    }
    console.log(
      "Підтверджено бронювання: userName=" +
        userName +
        ", fullName=" +
        fullName +
        ", classRoom=" +
        classRoom +
        ", номер броні: " +
        confirm._id
    );
    res.redirect("/confirmPayment");
  });

  // Страница заявок на відмову
  app.get("/cancelRequests", async (req, res) => {
    const requests = await CancelRequest.find({ status: "pending" }).sort({
      createdAt: 1,
    });
    res.render("cancelRequests/cancel", { requests });
  });

  app.post("/cancelRequests", async (req, res) => {
    const requests = await CancelRequest.find({ status: "pending" }).sort({
      createdAt: 1,
    });
    res.render("cancelRequests/cancel", { requests });
  });

  // Підтвердити відмову
  app.post("/confirmCancel", async (req, res) => {
    const { requestId } = req.body;
    const request = await CancelRequest.findById(requestId);
    if (!request) return res.status(404).send("Заявка не знайдена");
    request.status = "confirmed";
    await request.save();
    // Видаляємо бронь з Confirm
    await Confirm.deleteOne({ _id: request.bookingId });
    // Відправляємо повідомлення користувачу
    if (request.userId && bot && bot.telegram) {
      try {
        await bot.telegram.sendMessage(
          request.userId,
          `Ваша заявка на відмову підтверджена!\nСума повернення: ${request.refundAmount} грн (${request.refundPercentage}%)`
        );
      } catch (e) {
        console.error("Помилка відправки повідомлення про відмову:", e);
      }
    }
    res.redirect("/cancelRequests");
  });

  // Відхилити відмову
  app.post("/declineCancel", async (req, res) => {
    const { requestId, adminComment } = req.body;
    const request = await CancelRequest.findById(requestId);
    if (!request) return res.status(404).send("Заявка не знайдена");
    request.status = "declined";
    request.adminComment = adminComment;
    await request.save();
    // Відправляємо повідомлення користувачу
    if (request.userId && bot && bot.telegram) {
      try {
        await bot.telegram.sendMessage(
          request.userId,
          `Ваша заявка на відмову відхилена. Причина: ${adminComment}`
        );
      } catch (e) {
        console.error("Помилка відправки повідомлення про відмову:", e);
      }
    }
    res.redirect("/cancelRequests");
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`🌐 Admin panel started on port ${PORT}`);
    console.log(`📁 CSS directory: ${path.join(projectRoot, "public/css")}`);
  });
}
