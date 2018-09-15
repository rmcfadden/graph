export default class bezierCurveSplineProvider {
  static draw({
    x,
    y,
    options = {},
    layer,
  } = {}) {
    const { stroke, fill } = options;
    const { ctx } = layer;
    const {
      aX,
      aY,
    } = layer.getAdjustedPoint(x, y);

    if (!this.usingPath) {
      ctx.beginPath();
      layer.applyOptions(options);
    }

    // TODO

    if (!layer.usingPath && stroke) {
      ctx.stroke();
    }
    if (!layer.usingPath && fill) {
      ctx.fill();
    }
  }
}
