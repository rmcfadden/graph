import Utils from "../utils";

export default class AxesProvider {
  constructor(args) {
    this.ctx = args.ctx;
    this.calcs = args.calcs;
    this.layer = args.layer;
  }

  draw({
    axis = "x",
  } = {}) {
    const { ctx, calcs, layer } = this;
    const {
      xAxis,
      yAxis,
      xStart,
      xEnd,
      yStart,
      yEnd,
    } = calcs;

    ctx.beginPath();

    if (axis === "x" && xAxis.show) {
      ctx.strokeStyle = yAxis.style;
      ctx.lineWidth = yAxis.width;
      const { lineWidth } = ctx;
      ctx.moveTo(Utils.adjust(layer.xToScreen(xStart), lineWidth),
        Utils.adjust(layer.yToScreen(0), lineWidth));
      ctx.lineTo(Utils.adjust(layer.xToScreen(xEnd), lineWidth),
        Utils.adjust(layer.yToScreen(0), lineWidth));
    }

    if (axis === "y" && yAxis.show) {
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
