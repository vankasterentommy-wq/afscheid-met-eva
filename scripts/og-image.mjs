// Maakt public/og-image.jpg (1200×630) voor WhatsApp/Facebook-voorbeelden.
import sharp from 'sharp';
const W = 1200, H = 630;
const photo = await sharp('public/img/eva-bos.jpg').resize(470, 630, { fit: 'cover', position: 'attention' }).toBuffer();
const logo = await sharp('public/img/logo2-bordeaux.png').resize({ width: 560 }).toBuffer();
const lm = await sharp(logo).metadata();
await sharp({ create: { width: W, height: H, channels: 3, background: '#FAF7F2' } })
  .composite([
    { input: photo, left: W - 470, top: 0 },
    { input: logo, left: Math.round((W - 470 - 560) / 2), top: Math.round((H - lm.height) / 2) },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('public/og-image.jpg');
console.log('og-image.jpg klaar');
