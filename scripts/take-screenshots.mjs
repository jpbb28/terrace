import puppeteer from "puppeteer-core";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../press/screenshots-new");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = "https://terrasseseason.com";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

async function waitForMap(page) {
  // Wait for Leaflet map tiles to appear
  await page
    .waitForSelector(".leaflet-tile-loaded", { timeout: 15000 })
    .catch(() => {});
  await new Promise((r) => setTimeout(r, 2000));
}

// 1. Desktop — map and list
console.log("Taking desktop map+list...");
const page1 = await browser.newPage();
await page1.setViewport({ width: 1440, height: 900 });
await page1.goto(URL, { waitUntil: "networkidle2", timeout: 30000 });
await waitForMap(page1);
await page1.screenshot({ path: `${OUT}/desktop.png`, fullPage: false });
console.log("  done");

// 2. Desktop — detail panel (click first terrace card)
console.log("Taking desktop detail...");
const page2 = await browser.newPage();
await page2.setViewport({ width: 1440, height: 900 });
await page2.goto(URL, { waitUntil: "networkidle2", timeout: 30000 });
await waitForMap(page2);
// Click the first terrace card
await page2.click(
  '[data-testid="terrace-card"], .terrace-card, article, [class*="card"]',
);
await new Promise((r) => setTimeout(r, 1500));
await page2.screenshot({ path: `${OUT}/desktop-detail.png`, fullPage: false });
console.log("  done");

// 3. Mobile — list view
console.log("Taking mobile list...");
const page3 = await browser.newPage();
await page3.setViewport({ width: 390, height: 844, isMobile: true });
await page3.goto(URL, { waitUntil: "networkidle2", timeout: 30000 });
await new Promise((r) => setTimeout(r, 2000));
await page3.screenshot({ path: `${OUT}/mobile-list.png`, fullPage: false });
console.log("  done");

// 4. Mobile — map view (click map tab)
console.log("Taking mobile map...");
const page4 = await browser.newPage();
await page4.setViewport({ width: 390, height: 844, isMobile: true });
await page4.goto(URL, { waitUntil: "networkidle2", timeout: 30000 });
await new Promise((r) => setTimeout(r, 1000));
// Click the Carte tab (exact text match to avoid clicking other buttons)
await page4.evaluate(() => {
  const btns = Array.from(document.querySelectorAll("button"));
  const carteBtn = btns.find((b) => /^carte$/i.test(b.textContent.trim()));
  if (carteBtn) carteBtn.click();
});
await waitForMap(page4);
await page4.screenshot({ path: `${OUT}/mobile-map.png`, fullPage: false });
console.log("  done");

await browser.close();
console.log("All screenshots saved to press/screenshots-new/");
