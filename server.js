const express = require('express');
const { chromium } = require('playwright');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', async (req, res) => {
  const url = req.query.url;
  const fullPage = req.query.fullPage !== 'false';

  if (!url) return res.status(400).send('Missing URL parameter');

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = await browser.newPage();

  try {
    // Fake user-agent để tránh bị chặn bot
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
    );

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 90000 // 90s để chờ các trang load chậm như cafef.vn
    });

    await page.waitForTimeout(2000); // Chờ thêm 2s đảm bảo nội dung render xong

    const screenshot = await page.screenshot({ fullPage });

    await browser.close();
    res.status(200).set('Content-Type', 'image/png').send(screenshot);
  } catch (err) {
    await browser.close();
    res.status(500).send('Failed to capture screenshot: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Screenshot API running on port ${PORT}`);
});
