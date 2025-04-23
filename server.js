const express = require('express');
const { chromium } = require('playwright');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', async (req, res) => {
  const url = req.query.url;
  const fullPage = req.query.fullPage !== 'false';
  const clipParams = ['x', 'y', 'width', 'height'];
  const hasClip = clipParams.every(param => req.query[param]);

  if (!url) return res.status(400).send('Missing URL parameter');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 90000
    });

    await page.waitForTimeout(2000);

    let screenshotOptions = {};

    if (hasClip) {
      screenshotOptions.clip = {
        x: parseInt(req.query.x),
        y: parseInt(req.query.y),
        width: parseInt(req.query.width),
        height: parseInt(req.query.height),
      };
    } else {
      screenshotOptions.fullPage = true;
    }

    const screenshot = await page.screenshot(screenshotOptions);

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
