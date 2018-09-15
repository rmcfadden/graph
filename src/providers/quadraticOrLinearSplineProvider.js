export default class quadraticOrLinearSplineProvider {
  static draw({
    points,
    options = {},
    layer,
    type,
  } = {}) {
    const { stroke, fill } = options;
    const { ctx } = layer;

    if (!layer.usingPath) {
      ctx.beginPath();
      layer.applyOptions(options);
    }

    const { aX, aY } = layer.getAdjustedPoint(points[0].x, points[0].y);
    ctx.moveTo(aX, aY);

    let i = 1;
    for (; i < points.length - 1; i += 1) {
      const { aX: aX1, aY: aY1 } = layer.getAdjustedPoint(points[i].x, points[i].y);
      const { aX: aX2, aY: aY2 } = layer.getAdjustedPoint(points[i + 1].x, points[i + 1].y);
      const xc = (aX1 + aX2) / 2;
      const yc = (aY1 + aY2) / 2;

      const curveName = (type === "QuadraticSpline") ? "quadraticCurveTo" : "lineTo";
      ctx[curveName](aX1, aY1, xc, yc);
    }

    if (!layer.usingPath && stroke) {
      ctx.stroke();
    }
    if (!layer.usingPath && fill) {
      ctx.fill();
    }
  }
}
