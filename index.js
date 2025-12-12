// index.js - FINAL TERIMA BERES (copy replace entire file)
// deps: npm i express qrcode pdf-lib cors fs path
// --- Polyfill Node built-ins untuk Cloudflare build ---
const { Buffer } = require("buffer");
globalThis.Buffer = globalThis.Buffer || Buffer;

const assert = require("assert");
globalThis.assert = globalThis.assert || assert;

// --- Main Libraries ---
const express = require("express");
const QRCode = require("qrcode");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8250;
const LOGO_PATH = path.join(__dirname, "assets", "image", "jne-express-square.png");
const mmToPt = mm => (mm * 72) / 25.4;

function safeName(s){ return String(s||"").trim().replace(/[^a-z0-9_\- ]/gi,"_").replace(/\s+/g,"_"); }

app.get("/generate-visitor-card", async (req, res) => {
  try {
    const name = (req.query.name || "").trim();
    const visitorNumber = (req.query.visitorNumber || req.query.requestNumber || "").trim();
    const company = (req.query.company || "").trim() || "Perusahaan";
    const date = (req.query.date || "").trim() || "Tanggal";
    if(!name || !visitorNumber) return res.status(400).send("Missing name & visitorNumber");

    const cardW = mmToPt(85.6), cardH = mmToPt(140), topH = cardH * 0.76;
    const blue = rgb(39/255,67/255,125/255), white = rgb(1,1,1), black = rgb(0,0,0);
    const qrDataUrl = await QRCode.toDataURL(visitorNumber, { width: 1400, margin: 1, errorCorrectionLevel: "H" });
    const qrBuf = Buffer.from(qrDataUrl.split(",")[1], "base64");

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([cardW, cardH]);
    const fontR = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // background
    page.drawRectangle({ x:0,y:0,width:cardW,height:cardH,color:white });
    page.drawRectangle({ x:0,y:cardH-topH,width:cardW,height:topH,color:blue });

    // embed logo (guaranteed safe placement)
    let logoImg = null;
    if(fs.existsSync(LOGO_PATH)){
      try {
        const logoBuf = fs.readFileSync(LOGO_PATH);
        logoImg = await pdfDoc.embedPng(logoBuf);
        const logoW = cardW * 0.18;
        const logoScale = logoW / logoImg.width;
        const logoH = logoImg.height * logoScale;
        const panelY = cardH - topH;
        const logoY = panelY + topH - logoH - (topH * 0.10); // safe margin
        page.drawImage(logoImg, { x:(cardW-logoW)/2, y:logoY, width:logoW, height:logoH });
        // define QR baseline under logo
        var qrTopBaseline = Math.max( panelY + topH*0.52, logoY - (topH * 0.06) );
      } catch(e){ console.error("embed logo failed:", e.message); qrTopBaseline = panelY + topH*0.62; }
    } else {
      qrTopBaseline = cardH - topH + topH*0.62;
    }

    // embed QR with thin white frame
    const qrImg = await pdfDoc.embedPng(qrBuf);
    const qrW = cardW * 0.52;
    const qrH = qrImg.height * (qrW / qrImg.width);
    const qrX = (cardW - qrW)/2;
    const qrY = qrTopBaseline - qrH;
    const framePad = Math.max(6, qrW * 0.035);
    page.drawRectangle({ x:qrX-framePad, y:qrY-framePad, width:qrW+framePad*2, height:qrH+framePad*2, color:white });
    page.drawImage(qrImg, { x:qrX, y:qrY, width:qrW, height:qrH });

    // VISITOR title + number
    const title = "VISITOR", titleSize = 26;
    const titleY = qrY - 44;
    page.drawText(title, { x:(cardW - fontB.widthOfTextAtSize(title,titleSize))/2, y:titleY, size:titleSize, font:fontB, color:white });
    const numSize = 14;
    page.drawText(visitorNumber, { x:(cardW - fontR.widthOfTextAtSize(visitorNumber,numSize))/2, y:titleY - 22, size:numSize, font:fontR, color:white });

    // bottom panel text (centered)
    const bottomH = cardH - topH;
    const companySize = 16, nameSize = 14, dateSize = 12;
    page.drawText(company, { x:(cardW - fontR.widthOfTextAtSize(company,companySize))/2, y: bottomH * 0.65, size:companySize, font:fontR, color:black });
    page.drawText(name, { x:(cardW - fontB.widthOfTextAtSize(name,nameSize))/2, y: bottomH * 0.65 - nameSize - 8, size:nameSize, font:fontB, color:black });
    page.drawText(date, { x:(cardW - fontB.widthOfTextAtSize(date,dateSize))/2, y: bottomH * 0.65 - dateSize - 30, size:dateSize, font:fontR, color:black });

    const pdfBytes = await pdfDoc.save();
    const filename = `${safeName(company)}-${safeName(name)}-${safeName(visitorNumber)}.pdf`;
    res.setHeader("Content-Type","application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(Buffer.from(pdfBytes));
  } catch(err){
    console.error("generate error:", err);
    return res.status(500).send("Error generating PDF");
  }
});

app.listen(PORT, ()=> console.log("Visitor service running on", PORT));

/*
TEST 1 (local, uses local logo):
curl -o Mandiri-Alip_Hamjah-VIS-001.pdf "http://localhost:8250/generate-visitor-card?name=Alip%20Hamjah&visitorNumber=VIS-001&company=Mandiri"

TEST 2 (no-logo debug: temporarily rename assets/image/jne-express-square.png then run):
curl -o NoLogo-Test.pdf "http://localhost:8250/generate-visitor-card?name=Test&visitorNumber=VIS-999&company=NoLogoCo"

RISK: pastikan assets/image/jne-express-square.png ada & PNG valid; jika masih tidak tampil, restart service and check node console logs.
*/
