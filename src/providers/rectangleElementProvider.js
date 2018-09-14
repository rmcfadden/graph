export default class rectangleElementProvider {
  static draw({
    x,
    y,
    width,
    height,
    layer,
    options = {},
  } = {}) {
    const { stroke, fill } = options;
    const { ctx } = layer;
    const {
      aX,
      aY,
      aWidth,
      aHeight,
    } = layer.getAdjustedPointDimension(x, y, width, height);

    if (!layer.usingPath) {
      ctx.beginPath();
    }

    ctx.rect(aX, aY, aWidth, aHeight);

    if (!layer.usingPath && stroke) {
      ctx.stroke();
    }
    if (!layer.usingPath && fill) {
      ctx.fill();
    }
  }
}
