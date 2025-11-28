import sharp from "sharp";

export interface ImageCompressOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "jpg" | "png";
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  position?: "center" | "top" | "right top" | "right" | "right bottom" | "bottom" | "left bottom" | "left" | "left top";
}

/**
 * Compresses and optimizes an image buffer
 * @param buffer - Image buffer to compress
 * @param options - Compression options
 * @returns Compressed image buffer
 */
export async function compressImage(
  buffer: Buffer,
  options: ImageCompressOptions = {}
): Promise<Buffer> {
  const {
    width = 400,
    height = 400,
    quality = 80,
    format = "webp",
    fit = "cover",
    position = "center",
  } = options;

  let sharpInstance = sharp(buffer);

  // Resize if dimensions are provided
  if (width || height) {
    sharpInstance = sharpInstance.resize(width, height, {
      fit,
      position,
    });
  }

  // Convert to specified format
  switch (format) {
    case "webp":
      return sharpInstance.webp({ quality, effort: 6 }).toBuffer();
    case "jpeg":
    case "jpg":
      return sharpInstance.jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer();
    case "png":
      return sharpInstance.png({ quality, compressionLevel: 9 }).toBuffer();
    default:
      return sharpInstance.webp({ quality, effort: 6 }).toBuffer();
  }
}

/**
 * Compresses an image file and returns the buffer
 * @param file - File object to compress
 * @param options - Compression options
 * @returns Compressed image buffer
 */
export async function compressImageFile(
  file: File,
  options: ImageCompressOptions = {}
): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return compressImage(buffer, options);
}

