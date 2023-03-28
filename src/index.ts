import puppeteer from "puppeteer";
import * as fs from "fs"
import { Context, Telegraf } from "telegraf";
import { configs } from "./configs";

let bot: Telegraf;
const url = 'https://cryptobubbles.net/';

bot = new Telegraf(configs.BOT_TOKEN);
export const messageHome = async (message: string, ctx: Context) => {
  return ctx.replyWithMarkdownV2(message);
};
bot.use(async (ctx: any, next: any) => {
  try {
    if (ctx.message?.from) {
      const params: any = ctx.message?.from;
      const { id, first_name, last_name, username } = params;
      if (!configs.WHITELISTED_USERS.includes(id)) {
        return ctx.reply(
          `Hello ${
            first_name || last_name || username
          }, You are not whitelisted to receive notifications`
        );
      }
    }
    return next();
  } catch (error) {
    console.log(error);
  }
});


bot.start(async (ctx: any) => {
  const defaultMessage =
    `Hello Welcome to ${ctx?.me}, a screen short posting bot🔥`.replaceAll(
      "_",
      "\\_"
    );
  await messageHome(defaultMessage, ctx);
  setInterval(takeScreenshot, configs.INTERVAL * 60 * 1000);
});

bot.launch()


// Function that takes a screenshot of the website, sets the default tab to "hour", waits for 30 seconds after loading the page, saves the screenshot to a file, and sends it to the Telegram bot
async function takeScreenshot(): Promise<void> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // Set the default tab to "hour" by appending the "?time=hour" query parameter to the URL
  await page.goto(`${url}?time=hour`);
  await page.waitForTimeout(30000); // wait for 30 seconds before taking the screenshot
  const screenshot = await page.screenshot();
  console.log('screenshot taken')
  await browser.close();
  const filename = `screenshot-${Date.now()}.png`;
  fs.writeFileSync(filename, screenshot);
  for (const chatId of configs.WHITELISTED_USERS) {
    await bot.telegram.sendPhoto(chatId, { source: filename });
  }
  fs.unlinkSync(filename); // delete the screenshot file after sending it to the Telegram bot
}