import QRCode from 'qrcode-generator';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// JNE Logo as base64 PNG (you'll need to replace this with actual logo)
// For now using a placeholder - replace with actual JNE logo base64
const JNE_LOGO_BASE64 = null; // Set to null to skip logo, or provide base64 string

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      const url = new URL(request.url);
      if (url.pathname === '/generate-visitor-card') {
        const params = Object.fromEntries(url.searchParams);
        
        const pdfBytes = await generateVisitorCard(params);
        
        return new Response(pdfBytes, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeName(params.company || 'Visitor')}-${safeName(params.name || 'Card')}.pdf"`
          }
        });
      }
      
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders 
      });
    } catch (error) {
      console.error('Generation Error:', error);
      return new Response(`Error: ${error.message}`, { 
        status: 500,
        headers: corsHeaders 
      });
    }
  }
};

async function generateVisitorCard({
  name = '',
  visitorNumber = '',
  company = 'Google',
  date = '20-12-2025'
} = {}) {
  if (!name || !visitorNumber) {
    throw new Error('Name and Visitor Number are required');
  }

  try {
    const pdfDoc = await PDFDocument.create();
    
    // Card dimensions: 85.6mm x 140mm (ID card proportions)
    const cardW = mmToPt(85.6);
    const cardH = mmToPt(140);
    const page = pdfDoc.addPage([cardW, cardH]);
    
    const fontR = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Colors
    const darkBlue = rgb(39/255, 67/255, 125/255);
    const white = rgb(1, 1, 1);
    const black = rgb(0, 0, 0);

    // === LAYOUT ZONES ===
    // Top blue section: ~75% of card (logo + QR + VISITOR text)
    // Bottom white section: ~25% of card (company + name + date)
    
    const whiteZoneHeight = cardH * 0.25;
    const blueZoneHeight = cardH - whiteZoneHeight;

    // --- WHITE BOTTOM SECTION ---
    page.drawRectangle({ 
      x: 0, 
      y: 0, 
      width: cardW, 
      height: whiteZoneHeight, 
      color: white 
    });

    // --- BLUE TOP SECTION ---
    page.drawRectangle({ 
      x: 0, 
      y: whiteZoneHeight, 
      width: cardW, 
      height: blueZoneHeight, 
      color: darkBlue 
    });

    // === LOGO AREA (Top of blue section) ===
    const logoBoxSize = 50;
    const logoBoxX = (cardW - logoBoxSize) / 2;
    const logoBoxY = cardH - logoBoxSize - 15;
    const logoCornerRadius = 8;

    // White rounded rectangle for logo
    drawRoundedRect(page, logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, logoCornerRadius, white);

    // If we have a logo, embed it (placeholder for now - draws "JNE" text)
    // TODO: Replace with actual logo embedding
    page.drawText("JNE", {
      x: logoBoxX + 8,
      y: logoBoxY + 18,
      size: 14,
      font: fontB,
      color: rgb(0.8, 0.1, 0.1) // Red color for JNE
    });

    // === QR CODE ===
    const qrPngBytes = generateQRCodePNG(visitorNumber);
    const qrImg = await pdfDoc.embedPng(qrPngBytes);
    
    const qrSize = cardW * 0.60;
    const qrX = (cardW - qrSize) / 2;
    const qrY = logoBoxY - qrSize - 15;
    
    // White background for QR
    const qrPadding = 1;
    page.drawRectangle({
      x: qrX - qrPadding,
      y: qrY - qrPadding,
      width: qrSize + qrPadding,
      height: qrSize + qrPadding,
      color: white
    });

    // Draw QR Code
    page.drawImage(qrImg, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize
    });

    // === VISITOR TEXT (below QR, in blue zone) ===
    const visitorText = "VISITOR";
    const visitorFontSize = 22;
    const visitorTextWidth = fontB.widthOfTextAtSize(visitorText, visitorFontSize);
    const visitorY = qrY - qrPadding - 30;
    
    page.drawText(visitorText, {
      x: (cardW - visitorTextWidth) / 2,
      y: visitorY,
      size: visitorFontSize,
      font: fontB,
      color: white
    });

    // === VISITOR NUMBER (below VISITOR text) ===
    const visitorNumFontSize = 12;
    const visitorNumWidth = fontR.widthOfTextAtSize(visitorNumber, visitorNumFontSize);
    
    page.drawText(visitorNumber, {
      x: (cardW - visitorNumWidth) / 2,
      y: visitorY - 20,
      size: visitorNumFontSize,
      font: fontR,
      color: white
    });

    // === WHITE SECTION CONTENT ===
    // Company name
    const companyFontSize = 14;
    const companyWidth = fontR.widthOfTextAtSize(company, companyFontSize);
    const companyY = whiteZoneHeight - 33;
    
    page.drawText(company, {
      x: (cardW - companyWidth) / 2,
      y: companyY,
      size: companyFontSize,
      font: fontR,
      color: black
    });

    // Name (bold)
    const nameFontSize = 15;
    const nameWidth = fontB.widthOfTextAtSize(name, nameFontSize);
    
    page.drawText(name, {
      x: (cardW - nameWidth) / 2,
      y: companyY - 20,
      size: nameFontSize,
      font: fontB,
      color: black
    });

    // Date
    const dateFontSize = 13;
    const dateWidth = fontR.widthOfTextAtSize(date, dateFontSize);
    
    page.drawText(date, {
      x: (cardW - dateWidth) / 2,
      y: companyY - 40,
      size: dateFontSize,
      font: fontR,
      color: darkBlue
    });

    return await pdfDoc.save();

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate visitor card: ${error.message}`);
  }
}

/**
 * Draw a rounded rectangle (simulated with overlapping rectangles)
 */
function drawRoundedRect(page, x, y, width, height, radius, color) {
  // Main rectangle (slightly smaller)
  page.drawRectangle({
    x: x + radius,
    y: y,
    width: width - (radius * 2),
    height: height,
    color: color
  });
  
  page.drawRectangle({
    x: x,
    y: y + radius,
    width: width,
    height: height - (radius * 2),
    color: color
  });
  
  // Corner circles
  const corners = [
    { cx: x + radius, cy: y + radius },
    { cx: x + width - radius, cy: y + radius },
    { cx: x + radius, cy: y + height - radius },
    { cx: x + width - radius, cy: y + height - radius }
  ];
  
  for (const corner of corners) {
    page.drawCircle({
      x: corner.cx,
      y: corner.cy,
      size: radius,
      color: color
    });
  }
}

/**
 * Generate QR Code as PNG bytes (Cloudflare Workers compatible)
 */
function generateQRCodePNG(text) {
  const qr = QRCode(0, 'H');
  qr.addData(text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const cellSize = 10;
  const margin = 4;
  const size = (moduleCount + margin * 2) * cellSize;

  const pixels = new Uint8Array(size * size * 4);
  
  // Fill with white background
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 255;
    pixels[i + 1] = 255;
    pixels[i + 2] = 255;
    pixels[i + 3] = 255;
  }

  // Draw black modules
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        const startX = (col + margin) * cellSize;
        const startY = (row + margin) * cellSize;
        
        for (let py = 0; py < cellSize; py++) {
          for (let px = 0; px < cellSize; px++) {
            const idx = ((startY + py) * size + (startX + px)) * 4;
            pixels[idx] = 0;
            pixels[idx + 1] = 0;
            pixels[idx + 2] = 0;
            pixels[idx + 3] = 255;
          }
        }
      }
    }
  }

  return encodePNG(pixels, size, size);
}

function encodePNG(pixels, width, height) {
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = createIHDRChunk(width, height);
  const idat = createIDATChunk(pixels, width, height);
  const iend = createIENDChunk();

  const png = new Uint8Array(
    signature.length + ihdr.length + idat.length + iend.length
  );
  
  let offset = 0;
  png.set(signature, offset); offset += signature.length;
  png.set(ihdr, offset); offset += ihdr.length;
  png.set(idat, offset); offset += idat.length;
  png.set(iend, offset);

  return png;
}

function createIHDRChunk(width, height) {
  const data = new Uint8Array(13);
  const view = new DataView(data.buffer);
  
  view.setUint32(0, width, false);
  view.setUint32(4, height, false);
  data[8] = 8;
  data[9] = 6;
  data[10] = 0;
  data[11] = 0;
  data[12] = 0;

  return createChunk('IHDR', data);
}

function createIDATChunk(pixels, width, height) {
  const rawData = new Uint8Array(height * (1 + width * 4));
  
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    rawData[rowStart] = 0;
    
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = rowStart + 1 + x * 4;
      rawData[dstIdx] = pixels[srcIdx];
      rawData[dstIdx + 1] = pixels[srcIdx + 1];
      rawData[dstIdx + 2] = pixels[srcIdx + 2];
      rawData[dstIdx + 3] = pixels[srcIdx + 3];
    }
  }

  const compressed = deflateSync(rawData);
  return createChunk('IDAT', compressed);
}

function createIENDChunk() {
  return createChunk('IEND', new Uint8Array(0));
}

function createChunk(type, data) {
  const chunk = new Uint8Array(4 + 4 + data.length + 4);
  const view = new DataView(chunk.buffer);
  
  view.setUint32(0, data.length, false);
  
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }
  
  chunk.set(data, 8);
  
  const crcData = new Uint8Array(4 + data.length);
  for (let i = 0; i < 4; i++) {
    crcData[i] = type.charCodeAt(i);
  }
  crcData.set(data, 4);
  view.setUint32(8 + data.length, crc32(crcData), false);
  
  return chunk;
}

function deflateSync(data) {
  const blocks = [];
  const BLOCK_SIZE = 65535;
  
  blocks.push(new Uint8Array([0x78, 0x01]));
  
  let offset = 0;
  while (offset < data.length) {
    const remaining = data.length - offset;
    const blockLen = Math.min(remaining, BLOCK_SIZE);
    const isLast = offset + blockLen >= data.length;
    
    const header = new Uint8Array(5);
    header[0] = isLast ? 0x01 : 0x00;
    header[1] = blockLen & 0xFF;
    header[2] = (blockLen >> 8) & 0xFF;
    header[3] = ~blockLen & 0xFF;
    header[4] = (~blockLen >> 8) & 0xFF;
    blocks.push(header);
    
    blocks.push(data.slice(offset, offset + blockLen));
    
    offset += blockLen;
  }
  
  const adler = adler32(data);
  const adlerBytes = new Uint8Array(4);
  adlerBytes[0] = (adler >> 24) & 0xFF;
  adlerBytes[1] = (adler >> 16) & 0xFF;
  adlerBytes[2] = (adler >> 8) & 0xFF;
  adlerBytes[3] = adler & 0xFF;
  blocks.push(adlerBytes);
  
  const totalLen = blocks.reduce((sum, b) => sum + b.length, 0);
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const block of blocks) {
    result.set(block, pos);
    pos += block.length;
  }
  
  return result;
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function adler32(data) {
  let a = 1;
  let b = 0;
  const MOD = 65521;
  
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % MOD;
    b = (b + a) % MOD;
  }
  
  return ((b << 16) | a) >>> 0;
}

function mmToPt(mm) { 
  return (mm * 72) / 25.4; 
}

function safeName(s) { 
  return String(s || "")
    .trim()
    .replace(/[^a-z0-9_\- ]/gi, "_")
    .replace(/\s+/g, "_"); 
}