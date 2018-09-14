export default class lineElementProvider {
  static draw({
    x1,
    y1,
    x2,
    y2,
    options = {},
    layer,
  } = {}) {
    const { ctx } = layer;
    const aX1 = !layer.useNativeTransform ? layer.xToScreen(x1) : x1;
    const aY1 = !layer.useNativeTransform ? layer.yToScreen(y1) : y1;
    const aX2 = !layer.useNativeTransform ? layer.xToScreen(x2) : x2;
    const aY2 = !layer.useNativeTransform ? layer.yToScreen(y2) : y2;

    if (!layer.usingPath) {
      ctx.beginPath();
      layer.applyOptions(options);
    }

    ctx.moveTo(aX1, aY1);
    ctx.lineTo(aX2, aY2);

    if (!layer.usingPath) {
      ctx.stroke();
    }
  }
}
