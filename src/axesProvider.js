import Utils from "./utils";

export default class AxesProvider {
  constructor(args) {
    this.ctx = args.ctx;
    this.calcs = args.calcs;
  }

  draw() {
    const { ctx, calcs } = this;
    const {
      xAxis,
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
      ctx.moveTo(Utils.adjust(calcs.xToScreen(xStart), lineWidth),
      Utils.adjust(calcs.yToScreen(0), lineWidth));
      ctx.lineTo(Utils.adjust(calcs.xToScreen(xEnd), lineWidth),
      Utils.adjust(calcs.yToScreen(0), lineWidth));
    }

    if (yAxis.show) {
      ctx.strokeStyle = yAxis.style;
      ctx.lineWidth = yAxis.width;
      const { lineWidth } = ctx;
      ctx.moveTo(Utils.adjust(calcs.xToScreen(0), lineWidth),
      Utils.adjust(calcs.yToScreen(yStart), lineWidth));
      ctx.lineTo(Utils.adjust(calcs.xToScreen(0), lineWidth),
      Utils.adjust(calcs.yToScreen(yEnd), lineWidth));
    }
    ctx.stroke();
  }
}
