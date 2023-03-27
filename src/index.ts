import puppeteer from "puppeteer";
import * as fs from "fs"
import axios from "axios"
import FormData from "form-data";

const url:string = "https://cryptobubbles.net/"


const interval:number = 1;
const telegramEndpoint = "https://api.telegram.org/bot6002470637:AAGA78joqwYg6bFgUn_8RCuk8aSZu0wxKTg/sendPhoto"
const chatId = '5688202073'

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