const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Puppeteer দিয়ে TeraBox থেকে ডিরেক্ট ভিডিও লিংক বের করার ফাংশন
async function getDirectVideoLink(teraboxUrl) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  try {
    await page.goto(teraboxUrl, { waitUntil: 'networkidle2' });
    // আপনার TeraBox ভিডিও ডিরেক্ট লিংক কোথায় আছে তা স্ক্র্যাপ করার লজিক নিচে দিন
    // নিচে উদাহরণস্বরূপ ধরা হয়েছে: ভিডিও লিংক ভিডিও ট্যাগের 'src' এ আছে

    // কিছু ওয়েবসাইটে লিংক JS এ লুকানো থাকে, তাই wait বা evaluate করতে হতে পারে
    const videoUrl = await page.evaluate(() => {
      const video = document.querySelector('video');
      return video ? video.src : null;
    });

    await browser.close();
    return videoUrl;

  } catch (err) {
    await browser.close();
    throw err;
  }
}

// API রুট
app.post('/api/get-video-link', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL দিন' });
  }

  try {
    const directLink = await getDirectVideoLink(url);
    if (!directLink) {
      return res.status(404).json({ error: 'ভিডিও লিংক পাওয়া যায়নি' });
    }
    res.json({ directLink });
  } catch (error) {
    res.status(500).json({ error: 'লিংক বের করতে সমস্যা হয়েছে' });
  }
});

app.listen(PORT, () => {
  console.log(`Server চালু হয়েছে port: ${PORT}`);
});
