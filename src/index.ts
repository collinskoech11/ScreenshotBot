import puppeteer from "puppeteer";
import * as fs from "fs"
import axios from "axios"
import FormData from "form-data";
import dotenv from "dotenv"
import express from "express"

const url:string = "https://cryptobubbles.net/"

const app = express()


const interval:number = 15;
const bot_token = process.env.BOT_TOKEN
const telegramEndpoint = `https://api.telegram.org/bot${bot_token}/sendPhoto`
const chatId = process.env.CHAT_ID

async function takeScreenshot(): Promise<void> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${url}?time=hour`);
    await page.waitForTimeout(30000);
    const screenshot = await page.screenshot();
    await browser.close();
    const filename = `screenshot-${Date.now()}.png`;
    fs.writeFileSync(filename, screenshot);
    const formData = new FormData({ maxDataSize: 64 * 1024 });
    formData.append('chat_id', chatId);
    formData.append('photo', fs.createReadStream(filename));
    await axios.post(telegramEndpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    fs.unlinkSync(filename);
}

setInterval(takeScreenshot, interval * 60 * 1000)

app.listen(3000, () => {
    console.log("server is runing on port 3000")
})