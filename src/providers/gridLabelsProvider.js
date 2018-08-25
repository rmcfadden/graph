import LabelFormatter from "../formatters/labelFormatter";

export default class GridLabelsProvider {
  constructor(args) {
    this.ctx = args.ctx;
    this.calcs = args.calcs;
    this.graph = args.graph;
    this.layer = args.layer;

    this.getPositionContexts = (obj) => {
      const { position, margin } = obj;
      if (!position) { throw new Error("position argument cannot be empty"); }
      if (!margin) { throw new Error("margin argument cannot be empty"); }

      switch (obj.position) {
        case "center": return {
          textBaseline: "middle",
          textAlign: "center",
          xMargin: 0,
          yMargin: 0,
        };
        case "top": return {
          textBaseline: "bottom",
          textAlign: "center",
          xMargin: 0,
          yMargin: -1 * margin,
        };
        case "bottom": return {
          textBaseline: "top",
          textAlign: "center",
          xMargin: 0,
          yMargin: 1 * margin,
        };
        case "left": return {
          textBaseline: "middle",
          textAlign: "right",
        };
        case "right": return {
          textBaseline: "middle",
          textAlign: "left",
        };
        case "topleft": return {
          textBaseline: "bottom",
          textAlign: "right",
        };
        case "topright": return {
          textBaseline: "bottom",
          textAlign: "left",
        };
        case "bottomleft": return {
          textBaseline: "top",
          textAlign: "right",
        };
        case "bottomright": return {
          textBaseline: "top",
          textAlign: "left",
        };
        default: { throw new Error(`Unknown position ${position} provided`); }
      }
    };
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
    const { config } = this.graph;
    const {
      xRangeAdjusted,
      xRangeMinorAdjusted,
      xAxis,
      yAxis,
    } = calcs;

    const isXAxis = (axisDirection === "x");
    const axis = isXAxis ? xAxis : yAxis;
    const grid = isMajor ? axis.majorGrid : axis.minorGrid;
    const { labelHeight, labelFont, labelPosition, labelMargin } = grid;

    ctx.lineWidth = xAxis.width;

    if (grid.showLabels) {
      const range = isMajor ? xRangeAdjusted : xRangeMinorAdjusted;
      ctx.strokeStyle = config.backgroundStyle;
      ctx.fillStyle = grid.labelStyle;

      const xSignAdjust = -1 * ctx.measureText("-").width / 2.0;
      const useExponential = (
        range.find(p => LabelFormatter.shouldFormatExponential(p)) !== undefined
      );
      const formatter = new LabelFormatter({ useExponential });

      ctx.lineWidth = 3; // StrokeWidth
      ctx.font = `${labelHeight}px ${labelFont}`;

      const labels = range.map((x) => {
        const { textBaseline, textAlign, xMargin, yMargin } = this.getPositionContexts({
          position: labelPosition,
          margin: labelMargin,
        });
        const text = formatter ? formatter.format(x) : x;
        const metrics = ctx.measureText(text);
        const xSignOffset = (x < 0) ? xSignAdjust : 0;
        const yTextOffset = yMargin;
        const xTextOffset = xMargin + xSignOffset;
        const currentX = layer.xToScreen(x) + xTextOffset;
        const currentY = layer.yToScreen(0) + yTextOffset;
        return {
          currentX,
          currentY,
          text,
          metrics,
          xTextOffset,
          yTextOffset,
          textBaseline,
          textAlign,
        };
      });

      labels.forEach((label) => {
        const {
          currentX,
          currentY,
          text,
          textBaseline,
          textAlign,
        } = label;

        ctx.textBaseline = textBaseline;
        ctx.textAlign = textAlign;
        ctx.strokeText(text, currentX, currentY);
        ctx.fillText(text, currentX, currentY);
      });

    }
  }
}
