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
    try {
      const booking = await Booking.find();
      res.render(
        path.join(__dirname, "../web/views/confirmPayment/confirm.ejs"),
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
        path.join(__dirname, "../web/views/confirmPayment/confirm.ejs"),
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
        path.join(__dirname, "../web/views/activeBooking/active.ejs"),
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
    console.log(`🌐 Admin panel started on port ${PORT}`);
  });
}
