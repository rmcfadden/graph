import Utils from "./utils";

export default class AxesProvider {
  constructor(args) {
    this.ctx = args.ctx;
    this.calcs = args.calcs;
    this.layer = args.layer;
  }

  draw() {
    const { ctx, calcs, layer } = this;
    const {
      yAxis,
      xStart,
      xEnd,
      yStart,
      yEnd,
    } = calcs;

    ctx.beginPath();

    if (yAxis.show) {
      ctx.strokeStyle = yAxis.style;
      ctx.lineWidth = yAxis.width;
      const { lineWidth } = ctx;
      ctx.moveTo(Utils.adjust(layer.xToScreen(xStart), lineWidth),
        Utils.adjust(layer.yToScreen(0), lineWidth));
      ctx.lineTo(Utils.adjust(layer.xToScreen(xEnd), lineWidth),
        Utils.adjust(layer.yToScreen(0), lineWidth));
    }

    if (yAxis.show) {
      ctx.strokeStyle = yAxis.style;
      ctx.lineWidth = yAxis.width;
      const { lineWidth } = ctx;
      ctx.moveTo(Utils.adjust(layer.xToScreen(0), lineWidth),
        Utils.adjust(layer.yToScreen(yStart), lineWidth));
      ctx.lineTo(Utils.adjust(layer.xToScreen(0), lineWidth),
        Utils.adjust(layer.yToScreen(yEnd), lineWidth));
    }
    ctx.stroke();
  }
}
