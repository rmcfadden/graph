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
          xMargin: -2 * margin,
          yMargin: 0,
        };
        case "right": return {
          textBaseline: "middle",
          textAlign: "left",
          xMargin: 2 * margin,
          yMargin: 0,
        };
        case "topleft": return {
          textBaseline: "bottom",
          textAlign: "right",
          xMargin: -2 * margin,
          yMargin: -1 * margin,
        };
        case "topright": return {
          textBaseline: "bottom",
          textAlign: "left",
          xMargin: 2 * margin,
          yMargin: -1 * margin,
        };
        case "bottomleft": return {
          textBaseline: "top",
          textAlign: "right",
          xMargin: -2 * margin,
          yMargin: 1 * margin,
        };
        case "bottomright": return {
          textBaseline: "top",
          textAlign: "left",
          xMargin: 2 * margin,
          yMargin: 1 * margin,
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
      height,
      width,
      xRangeAdjusted,
      xRangeMinorAdjusted,
      xAxis,
      yAxis,
      xEnd,
    } = calcs;

    const isXAxis = (axisDirection === "x");
    const axis = isXAxis ? xAxis : yAxis;
    const grid = isMajor ? axis.majorGrid : axis.minorGrid;
    const {
      height: fontHeight,
      font,
      verticalPosition,
      horizontalPosition,
      margin,
      show,
      originHorizontalPosition,
      leftEdgeHorizontalPosition,
      rightEdgeHorizontalPosition,
      topEdgeVerticalPosition,
      bottomEdgeVerticalPosition,
      style,
      outOfRangeStyle,
    } = grid.label;

    ctx.lineWidth = xAxis.width;

    if (show) {
      const range = isMajor ? xRangeAdjusted : xRangeMinorAdjusted;
      ctx.strokeStyle = config.backgroundStyle;
      ctx.fillStyle = grid.labelStyle;

      const xSignAdjust = -1 * ctx.measureText("-").width / 2.0;
      const useExponential = (
        range.find(p => LabelFormatter.shouldFormatExponential(p)) !== undefined
      );

      const average = width / range.length;
      const formatter = new LabelFormatter({ useExponential });
      ctx.lineWidth = 3; // StrokeWidth
      ctx.font = `${fontHeight}px ${font}`;

      const labelMeasures = range.map((x) => {
        const text = formatter ? formatter.format(x) : x;
        const metrics = ctx.measureText(text);
        const length = metrics.width;
        return {
          x,
          text,
          metrics,
          length,
        };
      });

      const labels = labelMeasures.map((l) => {
        const { x, text, metrics } = l;

        let adjustedVerticalPosition = verticalPosition;
        let adjustedHorizontalPosition = horizontalPosition;
        // 0 position adjustment
        if (x === 0) {
          adjustedHorizontalPosition = originHorizontalPosition;
        }

        // top/bottom adjustments
        if ((layer.yToScreen(0) - (fontHeight + margin)) <= 0) {
          adjustedVerticalPosition = topEdgeVerticalPosition;
        } else if ((layer.yToScreen(0) + (fontHeight + margin)) >= height) {
          adjustedVerticalPosition = bottomEdgeVerticalPosition;
        }

        // left/right adjustments
        if ((layer.xToScreen(x) - metrics.width) <= 0) {
          adjustedHorizontalPosition = leftEdgeHorizontalPosition;
        } else if ((layer.xToScreen(x) + metrics.width) >= layer.xToScreen(xEnd)) {
          adjustedHorizontalPosition = rightEdgeHorizontalPosition;
        }

        const { textBaseline, textAlign, xMargin, yMargin } = this.getPositionContexts({
          position: adjustedVerticalPosition + adjustedHorizontalPosition,
          margin,
        });

        // out of range y adjustment
        let adjustedScreenY = layer.yToScreen(0);
        let adjustedStyle = style;
        if (layer.yToScreen(0) <= 0) {
          adjustedScreenY = 0;
          adjustedStyle = outOfRangeStyle;
        } else if (layer.yToScreen(0) >= height) {
          adjustedScreenY = height;
          adjustedStyle = outOfRangeStyle;
        }

        const xSignOffset = (x < 0) ? xSignAdjust : 0;
        const yTextOffset = yMargin;
        const xTextOffset = xMargin + xSignOffset;
        const currentX = layer.xToScreen(x) + xTextOffset;
        const currentY = adjustedScreenY + yTextOffset;
        return {
          currentX,
          currentY,
          text,
          metrics,
          xTextOffset,
          yTextOffset,
          textBaseline,
          textAlign,
          style: adjustedStyle,
        };
      });

      labels.forEach((label) => {
        const {
          currentX,
          currentY,
          text,
          textBaseline,
          textAlign,
          style: textStyle,
        } = label;

        ctx.textBaseline = textBaseline;
        ctx.textAlign = textAlign;
        ctx.fillStyle = textStyle;
        ctx.strokeText(text, currentX, currentY);
        ctx.fillText(text, currentX, currentY);
      });
    }
  }
}
