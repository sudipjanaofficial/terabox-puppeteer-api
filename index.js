const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

app.post('/extract', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL missing' });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    const videoUrl = await page.evaluate(() => {
      const video = document.querySelector('video');
      return video ? video.src : null;
    });

    await browser.close();

    if (videoUrl) {
      res.json({ videoUrl });
    } else {
      res.status(404).json({ error: 'Video URL not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
