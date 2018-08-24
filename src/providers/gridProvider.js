import Utils from "../utils";

export default class GridProvider {
  constructor(args) {
    this.ctx = args.ctx;
    this.calcs = args.calcs;
    this.graph = args.graph;
    this.layer = args.layer;    
  }

  draw({
    axisDirection = "x",
    isMajor = true,
  } = {}) {
    const {
      ctx,
      calcs,
      layer,
    } = this;
    const {
      xRangeAdjusted,
      yRangeAdjusted,
      xRangeMinorAdjusted,
      yRangeMinorAdjusted,
      xAxis,
      yAxis,
      xStart,
      xEnd,
      yStart,
      yEnd,
    } = calcs;

    const isXAxis = (axisDirection === "x");
    const axis = isXAxis ? xAxis : yAxis;
    const grid = isMajor ? axis.majorGrid : axis.minorGrid;
    const { textHeight } = grid;

    ctx.lineWidth = xAxis.width;

    if (grid.show) {
      let range = isMajor ? xRangeAdjusted : xRangeMinorAdjusted;
      if (!isXAxis) {
        range = isMajor ? yRangeAdjusted : yRangeMinorAdjusted;
      }
      const toScreen = isXAxis ? layer.yToScreen : layer.xToScreen;
      const rulerLength = textHeight / ((isMajor) ? 2.0 : 4.0);

      ctx.beginPath();
      ctx.strokeStyle = grid.style;
      ctx.lineWidth = grid.width;

      const axisStart = isXAxis ? yStart : xStart;
      const axisEnd = isXAxis ? yEnd : xEnd;

      range.forEach((p) => {
        const fixed = isXAxis ? layer.xToScreen(p) : layer.yToScreen(p);
        const gridType = "grid";
        const start = (grid.type === gridType) ? toScreen(axisStart)
          : -1 * rulerLength;
        const end = (grid.type === gridType) ? toScreen(axisEnd)
          : rulerLength;
        const xStartLine = isXAxis ? fixed : start;
        const xEndLine = isXAxis ? fixed : end;
        const yStartLine = isXAxis ? start : fixed;
        const yEndLine = isXAxis ? end : fixed;
        const { lineWidth } = ctx;
        ctx.moveTo(Utils.adjust(xStartLine, lineWidth), Utils.adjust(yStartLine, lineWidth));
        ctx.lineTo(Utils.adjust(xEndLine, lineWidth), Utils.adjust(yEndLine, lineWidth));
      });
      ctx.stroke();
    }
  }
}
