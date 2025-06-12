import { Composer, Scenes } from "telegraf";

// Функция отвечает на вопрос "Порядок заселення"
async function handleCheck(ctx) {
  await ctx.reply(
    "Заселення в нашому отелі відбувається о 12, а виселення о 11"
  );
  return ctx.scene.leave(); // Сразу выходим из сцены после сообщения
}

const check = new Composer();
check.on("text", handleCheck); // Обработка любого текста

// Создаем сцену "checkWizard"
const checkScene = new Scenes.WizardScene("checkWizard", check);

export default checkScene;
