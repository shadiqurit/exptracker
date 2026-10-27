import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createPng(width, height, drawFn) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    return (crc ^ 0xffffffff) >>> 0;
  }
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Draw a stylized ExpTracker icon: Emerald gradient + Dollar symbol
function drawAppIcon(x, y, w, h, isMaskable = false, isRound = false) {
  const nx = x / w;
  const ny = y / h;

  if (isRound) {
    const cx = nx - 0.5;
    const cy = ny - 0.5;
    if (Math.sqrt(cx * cx + cy * cy) > 0.49) {
      return [0, 0, 0, 0];
    }
  } else if (!isMaskable) {
    const cornerRadius = 0.22;
    const cx = nx < 0.5 ? nx : 1 - nx;
    const cy = ny < 0.5 ? ny : 1 - ny;
    if (cx < cornerRadius && cy < cornerRadius) {
      const dist = Math.sqrt((cornerRadius - cx) ** 2 + (cornerRadius - cy) ** 2);
      if (dist > cornerRadius) {
        return [0, 0, 0, 0];
      }
    }
  }

  // Emerald/Teal diagonal gradient
  const diag = (nx + ny) / 2;
  let r = Math.round(5 + diag * (20 - 5));
  let g = Math.round(150 + diag * (184 - 150));
  let b = Math.round(105 + diag * (166 - 105));

  // Center Dollar sign coordinates
  const px = (nx - 0.5) * 2;
  const py = (ny - 0.5) * 2;

  const inStem = Math.abs(px) <= 0.06 && Math.abs(py) <= 0.65;
  const dTop = Math.sqrt(px * px + (py + 0.25) * (py + 0.25));
  const inTopLoop = dTop >= 0.14 && dTop <= 0.26 && !(px > 0.08 && py < -0.25);
  const dBot = Math.sqrt(px * px + (py - 0.25) * (py - 0.25));
  const inBotLoop = dBot >= 0.14 && dBot <= 0.26 && !(px < -0.08 && py > 0.25);
  const inCenterCross = Math.abs(py + px * 0.8) <= 0.08 && Math.abs(px) <= 0.22 && Math.abs(py) <= 0.16;

  if (inStem || inTopLoop || inBotLoop || inCenterCross) {
    return [255, 255, 255, 255];
  }

  return [r, g, b, 255];
}

const publicDir = path.join(__dirname, 'public');

// Web & PWA Icons
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPng(192, 192, (x, y, w, h) => drawAppIcon(x, y, w, h, false, false)));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPng(512, 512, (x, y, w, h) => drawAppIcon(x, y, w, h, false, false)));
fs.writeFileSync(path.join(publicDir, 'icon-maskable.png'), createPng(512, 512, (x, y, w, h) => drawAppIcon(x, y, w, h, true, false)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, (x, y, w, h) => drawAppIcon(x, y, w, h, true, false)));

// Android Mipmap Icons
const androidResDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
if (fs.existsSync(androidResDir)) {
  const densities = [
    { dir: 'mipmap-mdpi', size: 48, foreSize: 108 },
    { dir: 'mipmap-hdpi', size: 72, foreSize: 162 },
    { dir: 'mipmap-xhdpi', size: 96, foreSize: 216 },
    { dir: 'mipmap-xxhdpi', size: 144, foreSize: 324 },
    { dir: 'mipmap-xxxhdpi', size: 192, foreSize: 432 },
  ];

  for (const d of densities) {
    const targetDir = path.join(androidResDir, d.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Square launcher
    const launcher = createPng(d.size, d.size, (x, y, w, h) => drawAppIcon(x, y, w, h, false, false));
    fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), launcher);

    // Round launcher
    const round = createPng(d.size, d.size, (x, y, w, h) => drawAppIcon(x, y, w, h, false, true));
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), round);

    // Foreground for adaptive icons
    const fore = createPng(d.foreSize, d.foreSize, (x, y, w, h) => drawAppIcon(x, y, w, h, true, false));
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), fore);
  }
  console.log('Updated Android launcher mipmaps with ExpTracker branding!');
}

console.log('Icons generation completed!');
