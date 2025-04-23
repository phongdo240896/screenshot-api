const express = require('express');
const { chromium } = require('playwright');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', async (req, res) => {
  const url = req.query.url;
  const fullPage = req.query.fullPage !== 'false';

  // Các tham số cắt ảnh
  const x = req.query.x ? parseInt(req.query.x) : null;
  const y = req.query.y ? parseInt(req.query.y) : null;
  const width = req.query.width ? parseInt(req.query.width) : null;
  const height = req.query.height ? parseInt(req.query.height) : null;

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

    await page.waitForTimeout(2000); // đợi thêm nội dung render xong

    let screenshot;

    if (x !== null && y !== null && width !== null && height !== null) {
      // Trường hợp chụp theo clip
      screenshot = await page.screenshot({
        clip: { x, y, width, height }
      });
    } else {
      // Mặc định chụp toàn trang
      screenshot = await page.screenshot({ fullPage });
    }

    await browser.close();
    res.set('Content-Type', 'image/png').send(screenshot);
  } catch (err) {
    await browser.close();
    res.status(500).send('Failed to capture screenshot: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Screenshot API running on port ${PORT}`);
});
