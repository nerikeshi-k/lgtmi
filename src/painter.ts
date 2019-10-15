import { CanvasRenderingContext2D, createCanvas, loadImage, Image } from 'canvas';

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

const MAX_WIDTH = 420;
const MAX_HEIGHT = 420;
const DEFAULT_TEXT_STYLE: TextStyle = {
  color: '#ffffff',
  fontFamily: 'Open Sans',
  position: 'middle',
  shadowColor: '#0005'
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
  const text = 'LGTM';
  const maxWidth = canvasSize.width * 0.85;
  const fontSize = getSuitableFontSize(text, canvasSize, maxWidth, style.fontFamily);
  ctx.font = createFontString(fontSize, style.fontFamily);
  ctx.textAlign = 'center';
  ctx.textBaseline = style.position;
  const x = canvasSize.width / 2
  const y = getYPosition(canvasSize.height, style.position);
  if (style.shadowColor != null) {
    ctx.fillStyle = style.shadowColor;
    ctx.fillText(text, x + fontSize / 25, y + fontSize / 25);

  }
  ctx.fillStyle = style.color;
  ctx.fillText(text, x, y);

  return canvas.toBuffer('image/png');
};

const getSuitableFontSize = (text: string, canvasSize: Size, maxWidth: number, fontFamily: string): number => {
  // create same size canvas
  const canvas = createCanvas(canvasSize.width, canvasSize.height);
  const ctx = canvas.getContext('2d');

  let fontSize = 200;

  do {
    fontSize = fontSize - 4;
    ctx.font = createFontString(fontSize, fontFamily);
  } while (ctx.measureText(text).width > maxWidth && fontSize > 10);
  return fontSize;
};

const createFontString = (fontSize: number, fontFamily: string): string => `bold ${fontSize}px "${fontFamily}"`;

const getYPosition = (canvasHeight: number, position: TextStyle['position']): number => {
  switch (position) {
    case 'top':
      return 0;
    case 'bottom':
      return canvasHeight;
    case 'middle':
    default:
      return canvasHeight * 0.5;
  }
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
