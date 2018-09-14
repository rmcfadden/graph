export default class arcElementProvider {
  static draw({
    x,
    y,
    r,
    sAngle,
    eAngle,
    counterclockwise = false,
    options = {},
    layer,
  } = {}) {
    const { stroke, fill } = options;
    const { ctx } = layer;
    const {
      aX,
      aY,
    } = layer.getAdjustedPoint(x, y);

    if (!layer.usingPath) {
      ctx.beginPath();
      layer.applyOptions(options);
    }

    ctx.arc(aX, aY, r, sAngle, eAngle, counterclockwise);

    if (!layer.usingPath && stroke) {
      ctx.stroke();
    }
    if (!layer.usingPath && fill) {
      ctx.fill();
    }
  }
}
