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

    await page.waitForTimeout(1500);

    const options = clipWidth && clipHeight
      ? { clip: { x: clipX || 0, y: clipY || 0, width: clipWidth, height: clipHeight } }
      : { fullPage };

    const screenshot = await page.screenshot(options);
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
