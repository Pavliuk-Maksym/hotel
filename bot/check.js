import { Composer, Scenes } from "telegraf";

async function handleCheck(ctx) {
  await ctx.reply(
    "Заселення в нашому отелі відбувається о 12, а виселення о 11"
  );
  return ctx.scene.leave();
}

const check = new Composer();
check.on("text", handleCheck);

const checkScene = new Scenes.WizardScene("checkWizard", check);

export default checkScene;
