import { Telegraf, Composer, Scenes } from "telegraf";

const check = new Composer();
check.on("text", async (ctx) => {
  await ctx.reply(
    "Заселення в нашому отелі відвувається о 12, а виселення о 11"
  );
  return ctx.scene.leave();
});
const checkScene = new Scenes.WizardScene("checkWizard", check);

export default checkScene;

// async function check(ctx) {
//   await ctx.reply(
//     "Заселення в нашому отелі відвувається о 12, а виселення о 11"
//   );
// }
