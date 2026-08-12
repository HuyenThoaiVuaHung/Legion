/**
 * VCNV obstacle image splitting — port of github.com/maik205/image-to-vcnv.
 *
 * The obstacle image is cut into five pieces on the canonical 1920×1080
 * canvas: four L-shaped corner pieces (each quadrant minus its overlap with
 * the center rectangle) and the center piece itself. Everything outside a
 * piece is transparent, so each piece can be layered over the puzzle grid —
 * and, more importantly, unrevealed parts of the image never reach players.
 *
 *   ┌───────┬───────┐   center = (W/4, H/4, W/2, H/2)
 *   │ 1   ┌─┴─┐   2 │   corner i = its W/2×H/2 quadrant minus center
 *   ├───┐ │ 5 │ ┌───┤
 *   │ 3 └─┴───┴─┘ 4 │   pieces[0..3] = corners, pieces[4] = center
 *   └───────┴───────┘
 */

export const VCNV_IMAGE_WIDTH = 1920;
export const VCNV_IMAGE_HEIGHT = 1080;
export const VCNV_PIECE_COUNT = 5;

/** Quadrant origins for corner pieces 1-4, as fractions of the canvas. */
const CORNER_ORIGINS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.5, 0],
  [0, 0.5],
  [0.5, 0.5],
];

async function loadImage(source: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(source);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Could not decode obstacle image'));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas produced no blob'))),
      'image/png',
    );
  });
}

/**
 * Cuts an obstacle image into its five reveal pieces.
 * @returns PNG blobs `[corner1, corner2, corner3, corner4, center]`,
 *          each 1920×1080 with transparency outside the piece.
 */
export async function splitVcnvImage(source: Blob): Promise<Blob[]> {
  const image = await loadImage(source);
  const width = VCNV_IMAGE_WIDTH;
  const height = VCNV_IMAGE_HEIGHT;
  const center = {
    x: width / 4,
    y: height / 4,
    w: width / 2,
    h: height / 2,
  };

  const pieces: Blob[] = [];

  for (const [ox, oy] of CORNER_ORIGINS) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.save();
    ctx.beginPath();
    ctx.rect(ox * width, oy * height, width / 2, height / 2);
    ctx.clip();
    ctx.drawImage(image, 0, 0, width, height);
    ctx.restore();
    ctx.clearRect(center.x, center.y, center.w, center.h);
    pieces.push(await toBlob(canvas));
  }

  const centerCanvas = document.createElement('canvas');
  centerCanvas.width = width;
  centerCanvas.height = height;
  const centerCtx = centerCanvas.getContext('2d')!;
  centerCtx.beginPath();
  centerCtx.rect(center.x, center.y, center.w, center.h);
  centerCtx.clip();
  centerCtx.drawImage(image, 0, 0, width, height);
  pieces.push(await toBlob(centerCanvas));

  return pieces;
}
