import { CardData, CardFormat, CardTheme } from '../types';

export interface PhotoTransform {
  zoom: number; // 0.5 to 2.5
  offsetX: number; // -200 to 200
  offsetY: number; // -200 to 200
  rotation?: number; // degrees
}

const THEME_ACCENTS: Record<CardTheme, { main: string; secondary: string; dark: string; glow: string }> = {
  cyan_surf: {
    main: '#c5a059',
    secondary: '#f0db9e',
    dark: '#1c160b',
    glow: 'rgba(197, 160, 89, 0.4)',
  },
  ember_bonfire: {
    main: '#d4af37',
    secondary: '#f0db9e',
    dark: '#1f1a08',
    glow: 'rgba(212, 175, 55, 0.4)',
  },
  sand_dunes: {
    main: '#e8c97a',
    secondary: '#c9985a',
    dark: '#221b0a',
    glow: 'rgba(232, 201, 122, 0.4)',
  },
  neon_palm: {
    main: '#b89756',
    secondary: '#e6ca85',
    dark: '#18140a',
    glow: 'rgba(184, 151, 86, 0.4)',
  },
};

/**
 * Main draw function that renders a card onto any HTMLCanvasElement.
 * Supports both full HD exporting (1080px wide) and real-time live preview scaling.
 */
export async function renderCardToCanvas(
  canvas: HTMLCanvasElement,
  data: Partial<CardData> & { photoImage?: HTMLImageElement | null },
  transform: PhotoTransform = { zoom: 1, offsetX: 0, offsetY: 0 },
  exportQuality: boolean = false
): Promise<void> {
  const format: CardFormat = data.format || 'format_b';
  const width = format === 'format_a' ? 1080 : 1080;
  const height = format === 'format_a' ? 1080 : 1350;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const theme = THEME_ACCENTS[data.theme || 'cyan_surf'];

  // 1. Draw Deep Ocean Background with Bioluminescent Wave Gradient
  drawBackground(ctx, width, height, theme);

  // 2. Draw User Photo Layer (if available)
  if (data.photoImage) {
    drawUserPhoto(ctx, data.photoImage, format, width, height, transform);
  } else {
    drawPhotoPlaceholder(ctx, format, width, height, theme);
  }

  // 3. Draw Frame / Card Overlays based on Format
  if (format === 'format_a') {
    drawFormatAFrame(ctx, width, height, theme, data);
  } else {
    drawFormatBIDCard(ctx, width, height, theme, data);
  }

  // 4. Draw Universal HH Goa Holographic Seal & Metadata Stamp
  drawHologramBadge(ctx, width, height, theme, data);
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: { main: string; secondary: string; dark: string; glow: string }
) {
  // Base dark obsidian gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0a0a0a');
  bgGrad.addColorStop(0.5, '#121212');
  bgGrad.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Bioluminescent wave aura
  const radialGlow = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, width * 0.8);
  radialGlow.addColorStop(0, theme.glow);
  radialGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // Subtle tech mesh grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawUserPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  format: CardFormat,
  canvasW: number,
  canvasH: number,
  transform: PhotoTransform
) {
  ctx.save();

  let boxX = 0;
  let boxY = 0;
  let boxW = canvasW;
  let boxH = canvasH;

  if (format === 'format_a') {
    // Square PFP circular cutout or full avatar area with 60px padding inner
    const margin = 80;
    boxX = margin;
    boxY = margin;
    boxW = canvasW - margin * 2;
    boxH = canvasH - margin * 2;

    // Rounded rectangle clipping path for PFP avatar window
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 40);
    ctx.clip();
  } else {
    // Format B: Builder Card photo window top region
    const margin = 60;
    boxX = margin;
    boxY = 160;
    boxW = canvasW - margin * 2;
    boxH = 680;

    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 28);
    ctx.clip();
  }

  // Draw dark photo backdrop
  ctx.fillStyle = '#090F1D';
  ctx.fillRect(boxX, boxY, boxW, boxH);

  // Calculate object-fit cover
  const imgRatio = img.width / img.height;
  const boxRatio = boxW / boxH;

  let renderW = boxW;
  let renderH = boxH;

  if (imgRatio > boxRatio) {
    renderH = boxH;
    renderW = boxH * imgRatio;
  } else {
    renderW = boxW;
    renderH = boxW / imgRatio;
  }

  // Apply zoom and offset transforms
  renderW *= transform.zoom;
  renderH *= transform.zoom;

  const centerX = boxX + boxW / 2 + transform.offsetX * (canvasW / 400);
  const centerY = boxY + boxH / 2 + transform.offsetY * (canvasH / 400);

  const drawX = centerX - renderW / 2;
  const drawY = centerY - renderH / 2;

  ctx.drawImage(img, drawX, drawY, renderW, renderH);

  ctx.restore();
}

function drawPhotoPlaceholder(
  ctx: CanvasRenderingContext2D,
  format: CardFormat,
  canvasW: number,
  canvasH: number,
  theme: { main: string; secondary: string; dark: string; glow: string }
) {
  ctx.save();
  const boxX = 80;
  const boxY = format === 'format_a' ? 80 : 160;
  const boxW = canvasW - 160;
  const boxH = format === 'format_a' ? canvasH - 160 : 680;

  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 32);
  ctx.fillStyle = '#0A1322';
  ctx.fill();
  ctx.strokeStyle = theme.main;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Placeholder camera icon / prompt
  ctx.fillStyle = theme.main;
  ctx.font = '600 24px "Syne", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('📷 UPLOAD YOUR PHOTO', canvasW / 2, boxY + boxH / 2 - 20);

  ctx.fillStyle = '#7B9EC9';
  ctx.font = '400 16px "Syne", sans-serif';
  ctx.fillText('JPG, PNG or HEIC format', canvasW / 2, boxY + boxH / 2 + 20);

  ctx.restore();
}

function drawFormatAFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: { main: string; secondary: string; dark: string; glow: string },
  data: Partial<CardData>
) {
  ctx.save();

  // Outer glossy frame border
  ctx.strokeStyle = theme.main;
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.roundRect(50, 50, width - 100, height - 100, 48);
  ctx.stroke();

  // Inner neon glow ring
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(76, 76, width - 152, height - 152, 36);
  ctx.stroke();

  // Top header banner pill
  const bannerW = 540;
  const bannerH = 68;
  const bannerX = (width - bannerW) / 2;
  const bannerY = 32;

  ctx.fillStyle = '#060A12';
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 34);
  ctx.fill();
  ctx.strokeStyle = theme.main;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = theme.main;
  ctx.font = '600 24px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏄‍♂️ HH GOA 2026 · HACKER', width / 2, bannerY + bannerH / 2);

  // Bottom overlay glass pill with user title or handle
  const bottomBannerW = 820;
  const bottomBannerH = 120;
  const bottomBannerX = (width - bottomBannerW) / 2;
  const bottomBannerY = height - 180;

  ctx.fillStyle = 'rgba(18, 18, 18, 0.92)';
  ctx.beginPath();
  ctx.roundRect(bottomBannerX, bottomBannerY, bottomBannerW, bottomBannerH, 24);
  ctx.fill();
  ctx.strokeStyle = theme.main;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw name / title text
  const nameText = (data.name || 'HH GOA BUILDER').toUpperCase();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 36px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(nameText, width / 2, bottomBannerY + 46);

  const titleText = data.title || data.role || 'Hacker Extraordinaire 🚀';
  ctx.fillStyle = theme.main;
  ctx.font = '600 20px "JetBrains Mono", monospace';
  ctx.fillText(titleText, width / 2, bottomBannerY + 88);

  ctx.restore();
}

function drawFormatBIDCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: { main: string; secondary: string; dark: string; glow: string },
  data: Partial<CardData>
) {
  ctx.save();

  // Card Outer Edge Frame
  ctx.strokeStyle = theme.main;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.roundRect(30, 30, width - 60, height - 60, 36);
  ctx.stroke();

  // Top Header Header Bar
  ctx.fillStyle = '#121212';
  ctx.beginPath();
  ctx.roundRect(50, 50, width - 100, 90, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Header Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 32px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('HH GOA 2026', 80, 106);

  // Header Right Badge: OFFICIAL BUILDER PASS
  ctx.fillStyle = theme.main;
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('BUILDER PASS', width - 80, 106);

  // Bottom Information Panel (Height 860 to 1290)
  const infoY = 860;
  const infoH = 410;

  // Glass card panel backdrop
  ctx.fillStyle = '#121212';
  ctx.beginPath();
  ctx.roundRect(60, infoY, width - 120, infoH, 24);
  ctx.fill();
  ctx.strokeStyle = theme.main;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 48px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(data.name || 'YOUR NAME', 100, infoY + 68);

  // Role
  ctx.fillStyle = '#7B9EC9';
  ctx.font = '500 24px "Syne", sans-serif';
  ctx.fillText(data.role || 'Fullstack Sorcerer · React / Python', 100, infoY + 114);

  // Builder Title Tag (Pill)
  const titleText = data.title || 'Fullstack Sorcerer 🧙';
  ctx.font = '600 20px "JetBrains Mono", monospace';
  const titleWidth = ctx.measureText(titleText).width + 36;

  ctx.fillStyle = theme.dark;
  ctx.beginPath();
  ctx.roundRect(100, infoY + 140, titleWidth, 48, 24);
  ctx.fill();
  ctx.strokeStyle = theme.main;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = theme.main;
  ctx.fillText(titleText, 118, infoY + 171);

  // X / Twitter Handle tag if present
  if (data.handle) {
    ctx.fillStyle = '#7B9EC9';
    ctx.font = '500 20px "JetBrains Mono", monospace';
    ctx.fillText(`𝕏 ${data.handle}`, 100, infoY + 230);
  }

  // Divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, infoY + 260);
  ctx.lineTo(width - 100, infoY + 260);
  ctx.stroke();

  // Bottom Metadata: Event Date & Card ID No
  const cardNoStr = `#${String(data.cardNo || 1024).padStart(4, '0')}`;

  ctx.fillStyle = '#7B9EC9';
  ctx.font = '500 16px "JetBrains Mono", monospace';
  ctx.fillText('EVENT: GOA, INDIA · JUNE 2026', 100, infoY + 310);
  ctx.fillText('STATUS: CONFIRMED HACKER', 100, infoY + 340);

  ctx.fillStyle = theme.main;
  ctx.font = '700 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(cardNoStr, width - 100, infoY + 330);

  ctx.restore();
}

function drawHologramBadge(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: { main: string; secondary: string; dark: string; glow: string },
  data: Partial<CardData>
) {
  ctx.save();

  // Draw small QR Code simulation / Holographic badge on bottom right of Format B or top right of Format A
  const format = data.format || 'format_b';
  if (format === 'format_b') {
    const qrX = width - 210;
    const qrY = 880;
    const qrSize = 100;

    // QR Box outline
    ctx.fillStyle = '#060A12';
    ctx.beginPath();
    ctx.roundRect(qrX, qrY, qrSize, qrSize, 12);
    ctx.fill();
    ctx.strokeStyle = theme.main;
    ctx.lineWidth = 1;
    ctx.stroke();

    // QR pixels pattern
    ctx.fillStyle = theme.main;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if ((i + j) % 2 === 0 || (i * j) % 3 === 0) {
          ctx.fillRect(qrX + 10 + i * 16, qrY + 10 + j * 16, 12, 12);
        }
      }
    }
  }

  ctx.restore();
}
