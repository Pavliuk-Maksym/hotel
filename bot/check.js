import { Composer, Scenes } from "telegraf";

// Функція відповідає на питання "Порядок заселення"
async function handleCheck(ctx) {
  await ctx.reply(
    "Заселення в нашому готелі відбувається о 12, а виселення о 11"
  );
  return ctx.scene.leave(); // Сразу виходимо зі сцени після повідомлення
}

const check = new Composer();
check.on("text", handleCheck); // Обробка будь-якого тексту

// Створюємо сцену "checkWizard"
const checkScene = new Scenes.WizardScene("checkWizard", check);

export default checkScene;
