export default class GridProvider {
  constructor(args) {
    this.ctx = args.ctx;
    this.calcs = args.calcs;
  }

  draw() {
    const { ctx } = this;
    const {
      yAxis,
      xStart,
      xEnd,
      yStart,
      yEnd,
    } = this.calcs;

    ctx.beginPath();

    if (yAxis.show) {
      ctx.strokeStyle = yAxis.style;
      ctx.lineWidth = yAxis.width;
      const { lineWidth } = ctx;
      ctx.moveTo(this.adjust(this.xToScreen(xStart), lineWidth),
        this.adjust(this.yToScreen(0), lineWidth));
      ctx.lineTo(this.adjust(this.xToScreen(xEnd), lineWidth),
        this.adjust(this.yToScreen(0), lineWidth));
    }

    if (yAxis.show) {
      ctx.strokeStyle = yAxis.style;
      ctx.lineWidth = yAxis.width;
      const { lineWidth } = ctx;
      ctx.moveTo(this.adjust(this.xToScreen(0), lineWidth),
        this.adjust(this.yToScreen(yStart), lineWidth));
      ctx.lineTo(this.adjust(this.xToScreen(0), lineWidth),
        this.adjust(this.yToScreen(yEnd), lineWidth));
    }

    ctx.stroke();
  }
}
