const express = require('express');
const { chromium } = require('playwright');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', async (req, res) => {
  const url = req.query.url;
  const fullPage = req.query.fullPage !== 'false';

  if (!url) return res.status(400).send('Missing URL parameter');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
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
