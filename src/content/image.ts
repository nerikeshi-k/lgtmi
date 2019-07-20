import * as Jimp from 'jimp';

const MAX_WIDTH = 400;
const MAX_HEIGHT = 400;

export const getImage = async (url: string) => {
  const img = await Jimp.read(url);
  const viewport = compress(img.bitmap.width, img.bitmap.height);
  return { url, viewport };
};

const compress = (width: number, height: number): { width: number; height: number } => {
  if (width >= height && width > MAX_WIDTH) {
    const scale = MAX_WIDTH / width;
    return {
      width: Math.floor(width * scale),
      height: Math.floor(height * scale)
    };
  }
  if (height > width && height > MAX_HEIGHT) {
    const scale = MAX_HEIGHT / height;
    return {
      width: Math.floor(width * scale),
      height: Math.floor(height * scale)
    };
  }
  return { width, height };
};
