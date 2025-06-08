import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { launchBot } from "./bot/launch_bot.js";
import { launchAdminPanel } from "./web/launch_admin_panel.js";

(async () => {
  try {
    await mongoose.connect(process.env.URL_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    const bot = await launchBot();
    launchAdminPanel(bot);
  } catch (err) {
    console.error("❌ Error during app startup:", err);
  }
})();
