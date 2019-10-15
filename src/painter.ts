import { createCanvas, Image, loadImage } from 'canvas';

interface Size {
  width: number;
  height: number;
}

export interface TextStyle {
  color: string;
  fontFamily: string;
  position: 'top' | 'middle' | 'bottom';
  shadowColor: string | null;
}

const MAX_WIDTH = 450;
const MAX_HEIGHT = 450;
const DEFAULT_TEXT_STYLE: TextStyle = {
  color: '#ffffff',
  fontFamily: 'Noto Sans',
  position: 'middle',
  shadowColor: '#0004'
};

const download = async (sourceImageUrl: string) => {
  try {
    return await loadImage(sourceImageUrl);
  } catch (e) {
    return null;
  }
};

const getCompressedCanvasSize = (size: Size): Size => {
  if (size.width >= size.height && size.width > MAX_WIDTH) {
    const scale = MAX_WIDTH / size.width;
    return {
      width: Math.floor(size.width * scale),
      height: Math.floor(size.height * scale)
    };
  }
  if (size.height > size.width && size.height > MAX_HEIGHT) {
    const scale = MAX_HEIGHT / size.height;
    return {
      width: Math.floor(size.width * scale),
      height: Math.floor(size.height * scale)
    };
  }
  return size;
};

const paint = (image: Image, optionalStyle?: Partial<TextStyle>): Buffer => {
  const style: TextStyle = {
    ...DEFAULT_TEXT_STYLE,
    ...optionalStyle
  };
  const canvasSize = getCompressedCanvasSize(image);

  const canvas = createCanvas(canvasSize.width, canvasSize.height);
  const ctx = canvas.getContext('2d');

  // draw base Image
  ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvasSize.width, canvasSize.height);

  // write LGTM
  const text = 'L G T M';
  const maxWidth = canvasSize.width * 0.85;
  const fontSize = getSuitableFontSize(text, canvasSize, maxWidth, style.fontFamily);
  const x = canvasSize.width / 2;
  const textHeight = getTextHeight(text, fontSize, style.fontFamily);
  const y = getYPosition(textHeight, canvasSize, style.position);
  ctx.font = createFontString(fontSize, style.fontFamily);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // write shadow
  if (style.shadowColor != null) {
    ctx.fillStyle = style.shadowColor;
    ctx.fillText(text, x + fontSize / 25, y + fontSize / 25);
  }
  ctx.fillStyle = style.color;
  ctx.fillText(text, x, y);

  // write Looks Good To Me
  const miniText = 'L   o   o   k   s        G   o   o   d        T   o        M   e';
  const miniFontSize = fontSize * 0.17;
  ctx.font = createFontString(miniFontSize, style.fontFamily);
  ctx.textAlign = 'center';
  const miniY = y + textHeight * 0.75;
  // write shadow
  if (style.shadowColor != null) {
    ctx.fillStyle = style.shadowColor;
    ctx.fillText(miniText, x + fontSize / 45, miniY + fontSize / 45);
  }
  ctx.fillStyle = style.color;
  ctx.fillText(miniText, x, miniY);

  return canvas.toBuffer('image/png');
};

const getSuitableFontSize = (text: string, canvasSize: Size, maxWidth: number, fontFamily: string): number => {
  // create same size canvas
  const canvas = createCanvas(canvasSize.width, canvasSize.height);
  const ctx = canvas.getContext('2d');

  for (let fontSize = 100; fontSize > 10; fontSize -= 4) {
    ctx.font = createFontString(fontSize, fontFamily);
    if (ctx.measureText(text).width < maxWidth) {
      return fontSize;
    }
  }
  return 10;
};

const createFontString = (fontSize: number, fontFamily: string, bold: boolean = true): string =>
  `${bold ? 'bold ' : ''}${fontSize}px "${fontFamily}"`;

const getTextHeight = (text: string, fontSize: number, fontFamily: string): number => {
  const canvas = createCanvas(MAX_WIDTH, MAX_HEIGHT);
  const ctx = canvas.getContext('2d');
  ctx.font = createFontString(fontSize, fontFamily);
  const textMetrics = ctx.measureText(text);
  return textMetrics.actualBoundingBoxAscent - textMetrics.actualBoundingBoxDescent;
};

const getYPosition = (textHeight: number, canvasSize: Size, position: TextStyle['position']): number => {
  if (position === 'middle') {
    return canvasSize.height / 2;
  }
  if (position === 'top') {
    for (let y = 0; y < canvasSize.height / 2; y += 5) {
      if (y - textHeight / 2 > canvasSize.height * 0.05) {
        return y;
      }
    }
    return canvasSize.height / 2;
  }
  if (position === 'bottom') {
    for (let y = canvasSize.height; y > canvasSize.height / 2; y -= 5) {
      if (y + textHeight / 2 < canvasSize.height * 0.9) {
        return y;
      }
    }
    return canvasSize.height / 2;
  }
  return canvasSize.height / 2;
};

export const createImage = async (
  sourceImageUrl: string,
  optionalStyle?: Partial<TextStyle>
): Promise<Buffer | null> => {
  const image = await download(sourceImageUrl);
  if (image == null) {
    return null;
  }
  return paint(image, optionalStyle);
};
