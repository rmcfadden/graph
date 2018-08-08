import Utils from "./utils";
import labelFormatter from "./labelFormatter";


export default class AxesProvider {
  constructor(args) {
    this.ctx = args.ctx;
    this.calcs = args.calcs;
    this.graph = args.graph;
  }

  draw({
    axisDirection = "x",
    isMajor = true,
  } = {}) {
    const { 
      ctx,
      calcs,
    } = this;
    const { config } = this.graph;
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
      const toScreen = isXAxis ? calcs.yToScreen : calcs.xToScreen;
      const rulerLength = textHeight / ((isMajor) ? 2.0 : 4.0);

      ctx.beginPath();
      ctx.strokeStyle = grid.style;
      ctx.lineWidth = grid.width;

      const axisStart = isXAxis ? yStart : xStart;
      const axisEnd = isXAxis ? yEnd : xEnd;

      range.forEach((p) => {
        const fixed = isXAxis ? calcs.xToScreen(p) : calcs.yToScreen(p);
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

      // Draw horizontal labels
      ctx.strokeStyle = config.backgroundStyle;
      ctx.fillStyle = grid.labelStyle;

      const dashWidth = ctx.measureText("-").width / 2.0;

      // TODO: remove labels if they overlap
      const mod = 1;
      range.forEach((p, i) => {
        if ((i % mod) !== 0) { return; }
        if (grid.showLabels) {
          if (isXAxis) {
            const labelFormat = labelFormatter.format;
            const pFormatted = labelFormat ? labelFormat(p) : p;
            const textMetrics = ctx.measureText(pFormatted);
            let xTextOffset = (textMetrics.width / 2.0);
            if (p < 0) {
              xTextOffset += dashWidth;
            }

            if (p === 0) {
              xTextOffset += (textHeight / 2.0);
            }

            const yTextOffset = -1 * textHeight;
            ctx.lineWidth = 4; // StrokeWidth
            ctx.font = `${textHeight}px Arial`;

            let currentX = calcs.xToScreen(p) - xTextOffset;
            const currentY = calcs.yToScreen(0) - yTextOffset;

            let isInScreenBounds = calcs.isInScreenBounds({ x: currentX, y: currentY })
              && calcs.isInScreenBounds({ x: calcs.xToScreen(p) + xTextOffset, y: currentY });
            if (i === 0 && !isInScreenBounds) {
              currentX += xTextOffset + dashWidth;
              isInScreenBounds = true;
            }

            if (i === range.length) {
              currentX -= xTextOffset;
              isInScreenBounds = true;
            }

            if (isInScreenBounds) {
              ctx.strokeText(pFormatted, currentX, currentY);
              ctx.fillText(pFormatted, currentX, currentY);
            }
          }
        }
      });
    }
  }
}
