import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();
const outDir = path.join(root, "public/assets");
const width = 1200;
const height = 630;

const cards = [
  {
    file: "og-default.png",
    label: "CRITICAL ARCHIVE",
    title: ["EUGENICS:", "A CRITICAL HISTORY"],
    subtitle: "EDUCATION AND CRITIQUE ONLY",
    footer: "ARCHIVE - POLICY - GLOSSARY",
    palette: {
      paper: "#f4efe7",
      ink: "#18324a",
      muted: "#5d6770",
      accent: "#ad5a46",
      panel: "#fcfaf5",
      line: "#d8caba"
    }
  },
  {
    file: "og-history.png",
    label: "HISTORY",
    title: ["HISTORICAL HARM,", "POLICY, AND INSTITUTIONS"],
    subtitle: "SOURCE-BACKED CRITICAL HISTORY",
    footer: "TIMELINE - LAWS - COUNTRY CASES",
    palette: {
      paper: "#f1eadf",
      ink: "#202b33",
      muted: "#665d53",
      accent: "#9d4c3f",
      panel: "#fbf7ef",
      line: "#d1b894"
    }
  },
  {
    file: "og-bioethics.png",
    label: "BIOETHICS",
    title: ["GENETICS, CONSENT,", "RIGHTS, AND BOUNDARIES"],
    subtitle: "BIOETHICS WITHOUT MEDICAL ADVICE",
    footer: "CONSENT - DIGNITY - NON-DISCRIMINATION",
    palette: {
      paper: "#eef4ef",
      ink: "#173f46",
      muted: "#526d67",
      accent: "#4f816a",
      panel: "#fbfdf8",
      line: "#c0d2c4"
    }
  },
  {
    file: "og-teaching.png",
    label: "TEACHING",
    title: ["TEACHING THIS HISTORY", "RESPONSIBLY"],
    subtitle: "CLASSROOM FRAMING AND CONTEXT",
    footer: "EDUCATOR ROUTE - SOURCE PACKETS - PROMPTS",
    palette: {
      paper: "#f6f2e8",
      ink: "#263238",
      muted: "#5d6465",
      accent: "#486f8d",
      panel: "#fffdf7",
      line: "#d8c9a8"
    }
  }
];

const font = {
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  4: ["10010", "10010", "10010", "11111", "00010", "00010", "00010"],
  5: ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  6: ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
  ",": ["00000", "00000", "00000", "00000", "00100", "00100", "01000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"]
};

function rgb(hex) {
  const normalized = hex.replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16)
  ];
}

function createCanvas(background) {
  const [r, g, b] = rgb(background);
  const buffer = Buffer.alloc(width * height * 4);
  for (let index = 0; index < buffer.length; index += 4) {
    buffer[index] = r;
    buffer[index + 1] = g;
    buffer[index + 2] = b;
    buffer[index + 3] = 255;
  }
  return buffer;
}

function fillRect(buffer, x, y, rectWidth, rectHeight, color) {
  const [r, g, b] = rgb(color);
  const xStart = Math.max(0, Math.floor(x));
  const yStart = Math.max(0, Math.floor(y));
  const xEnd = Math.min(width, Math.ceil(x + rectWidth));
  const yEnd = Math.min(height, Math.ceil(y + rectHeight));
  for (let row = yStart; row < yEnd; row += 1) {
    for (let column = xStart; column < xEnd; column += 1) {
      const index = (row * width + column) * 4;
      buffer[index] = r;
      buffer[index + 1] = g;
      buffer[index + 2] = b;
      buffer[index + 3] = 255;
    }
  }
}

function strokeRect(buffer, x, y, rectWidth, rectHeight, color, lineWidth = 2) {
  fillRect(buffer, x, y, rectWidth, lineWidth, color);
  fillRect(buffer, x, y + rectHeight - lineWidth, rectWidth, lineWidth, color);
  fillRect(buffer, x, y, lineWidth, rectHeight, color);
  fillRect(buffer, x + rectWidth - lineWidth, y, lineWidth, rectHeight, color);
}

function drawText(buffer, text, x, y, scale, color, spacing = 1) {
  const glyphWidth = 5;
  let cursor = x;
  for (const rawChar of text.toUpperCase()) {
    const glyph = font[rawChar] || font[" "];
    for (let row = 0; row < glyph.length; row += 1) {
      for (let column = 0; column < glyph[row].length; column += 1) {
        if (glyph[row][column] === "1") {
          fillRect(buffer, cursor + column * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cursor += (glyphWidth + spacing) * scale;
  }
}

function textWidth(text, scale, spacing = 1) {
  const glyphWidth = 5;
  const units = Math.max(0, text.length * (glyphWidth + spacing) - spacing);
  return units * scale;
}

function fitScale(text, preferredScale, maxWidth, spacing = 1, minScale = 2) {
  if (textWidth(text, preferredScale, spacing) <= maxWidth) return preferredScale;
  return Math.max(minScale, Math.floor(maxWidth / textWidth(text, 1, spacing)));
}

function drawFitText(buffer, text, x, y, preferredScale, maxWidth, color, spacing = 1, minScale = 2) {
  drawText(buffer, text, x, y, fitScale(text, preferredScale, maxWidth, spacing, minScale), color, spacing);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function pngFromRgba(rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let row = 0; row < height; row += 1) {
    const rawOffset = row * (width * 4 + 1);
    const rgbaOffset = row * width * 4;
    raw[rawOffset] = 0;
    rgba.copy(raw, rawOffset + 1, rgbaOffset, rgbaOffset + width * 4);
  }

  const header = Buffer.from("89504e470d0a1a0a", "hex");
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    header,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function drawCard(card) {
  const buffer = createCanvas(card.palette.paper);
  fillRect(buffer, 52, 50, 1096, 530, card.palette.panel);
  strokeRect(buffer, 52, 50, 1096, 530, card.palette.line, 2);
  fillRect(buffer, 52, 50, 18, 530, card.palette.accent);
  fillRect(buffer, 92, 92, 208, 18, card.palette.accent);
  fillRect(buffer, 92, 126, 112, 6, card.palette.line);
  fillRect(buffer, 92, 150, 172, 6, card.palette.line);
  strokeRect(buffer, 860, 92, 218, 360, card.palette.line, 2);
  fillRect(buffer, 892, 126, 154, 10, card.palette.line);
  fillRect(buffer, 892, 158, 126, 10, card.palette.line);
  fillRect(buffer, 892, 190, 178, 10, card.palette.line);
  fillRect(buffer, 892, 222, 138, 10, card.palette.line);
  fillRect(buffer, 892, 286, 112, 10, card.palette.line);
  fillRect(buffer, 892, 318, 168, 10, card.palette.line);
  fillRect(buffer, 892, 350, 130, 10, card.palette.line);
  fillRect(buffer, 842, 92, 4, 360, card.palette.accent);
  fillRect(buffer, 92, 500, 986, 2, card.palette.line);

  drawFitText(buffer, card.label, 92, 236, 5, 720, card.palette.accent, 1);
  drawFitText(buffer, card.title[0], 92, 306, 10, 720, card.palette.ink, 1, 4);
  drawFitText(buffer, card.title[1], 92, 388, 8, 720, card.palette.ink, 1, 4);
  drawFitText(buffer, card.subtitle, 94, 462, 4, 720, card.palette.muted, 1, 3);
  drawFitText(buffer, "EUGENICS: A CRITICAL HISTORY", 92, 528, 3, 720, card.palette.muted, 1, 2);
  drawFitText(buffer, card.footer, 92, 560, 3, 720, card.palette.muted, 1, 2);
  return buffer;
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  for (const card of cards) {
    const pngPath = path.join(outDir, card.file);
    await fs.writeFile(pngPath, pngFromRgba(drawCard(card)));
    const stat = await fs.stat(pngPath);
    console.log(`[generate-og-images] wrote ${path.relative(root, pngPath)} ${stat.size} bytes`);
  }
}

await main();
