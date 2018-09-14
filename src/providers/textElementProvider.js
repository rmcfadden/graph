export default class textElementProvider {
  static draw({
    x,
    y,
    text,
    options = {
      fill: true,
    },
    layer,
  } = {}) {
    const { stroke, fill } = options;
    const { ctx } = layer;

    const lastUseNativeTransform = layer.useNativeTransform;
    layer.useNativeTransform = false;
    const {
      aX,
      aY,
    } = layer.getAdjustedPoint(x, y);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    layer.applyOptions(options);

    if (stroke) {
      ctx.strokeText(text, aX, aY);
    }
    if (fill !== false) {
      ctx.fillText(text, aX, aY);
    }
    ctx.restore();
    layer.useNativeTransform = lastUseNativeTransform;
  }
}
