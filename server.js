const express = require('express');
const { chromium } = require('playwright');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', async (req, res) => {
  const url = req.query.url;
  const fullPage = req.query.fullPage !== 'false';

  const clipX = parseInt(req.query.x);
  const clipY = parseInt(req.query.y);
  const clipWidth = parseInt(req.query.width);
  const clipHeight = parseInt(req.query.height);

  if (!url) return res.status(400).send('Missing URL parameter');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // chờ load thêm để tránh bị trắng hoặc thiếu dữ liệu
    await page.waitForTimeout(1500);

    let screenshotOptions = {};

    if (
      !isNaN(clipX) && !isNaN(clipY) &&
      !isNaN(clipWidth) && clipWidth > 0 &&
      !isNaN(clipHeight) && clipHeight > 0
    ) {
      screenshotOptions.clip = {
        x: clipX,
        y: clipY,
        width: clipWidth,
        height: clipHeight
      };
    } else {
      screenshotOptions.fullPage = fullPage;
    }

    const screenshot = await page.screenshot(screenshotOptions);
    await browser.close();

    res.set('Content-Type', 'image/png');
    res.send(screenshot);
  } catch (err) {
    await browser.close();
    res.status(500).send('Failed to capture screenshot: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Screenshot API running on port ${PORT}`);
});
