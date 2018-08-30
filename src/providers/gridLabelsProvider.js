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
    axis = "x",
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
      yRangeAdjusted,
      yRangeMinorAdjusted,
      xAxis,
      yAxis,
      xStart,
      xEnd,
      yStart,
      yEnd,
    } = calcs;

    const isXAxis = (axis === "x");
    const selectedAxis = isXAxis ? xAxis : yAxis;
    const grid = isMajor ? selectedAxis.majorGrid : selectedAxis.minorGrid;
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
      hidden,
      showZero,
    } = grid.labels;

    ctx.lineWidth = selectedAxis.width;

    if (show) {
      const rangeAdjusted = (axis === "x") ? xRangeAdjusted : yRangeAdjusted;
      const rangeMinorAdjusted = (axis === "x") ? xRangeMinorAdjusted : yRangeMinorAdjusted;
      const range = isMajor ? rangeAdjusted : rangeMinorAdjusted;

      ctx.strokeStyle = config.backgroundStyle;
      ctx.fillStyle = grid.labelStyle;

      const xSignAdjust = -1 * ctx.measureText("-").width / 2.0;
      const useExponential = (
        range.find(p => LabelFormatter.shouldFormatExponential(p)) !== undefined
      );

      const gridLength = width / range.length;
      const formatter = new LabelFormatter({ useExponential });
      ctx.lineWidth = 3; // StrokeWidth
      ctx.font = `${fontHeight}px ${font}`;

      const labelMeasures = range.map((v) => {
        const isHidden = hidden[v] || false;
        const text = formatter ? formatter.format(v) : v;
        const metrics = ctx.measureText(text);
        const length = metrics.width;
        return {
          v,
          text,
          metrics,
          length,
          isHidden: isHidden || (!showZero && v === 0),
        };
      });

      // reduce the number of labels by 2 if averageTextLength > averageGridLengt
      let adjustedLabelMeasures = [...labelMeasures];
      let maxTextLength = adjustedLabelMeasures.map(v => v.length)
        .reduce((prev, next) => Math.max(prev, next), 0);

      const zeroIndex = adjustedLabelMeasures.findIndex(l => l.v === 0);
      const zeroIndexAlign = ((zeroIndex % 2) === 0) ? 0 : 1;

      for (let i = 1; maxTextLength > gridLength && adjustedLabelMeasures.length >= 2; i += 1) {
        adjustedLabelMeasures = adjustedLabelMeasures.filter((_, j) => (j % 2) === zeroIndexAlign);
        maxTextLength = adjustedLabelMeasures.map(v => v.length)
          .reduce((prev, next) => Math.max(prev, next), 0) / (2 ** i);
      }

      const labels = adjustedLabelMeasures.map((l) => {
        const { v, text, metrics, length, isHidden } = l;

        let adjustedVerticalPosition = verticalPosition;
        let adjustedHorizontalPosition = horizontalPosition;

        let adjustedIsHidden = isHidden;

        if (axis === "x") {
          // 0 position adjustment
          if (v === 0) {
            adjustedHorizontalPosition = originHorizontalPosition;
          }

          // top/bottom adjustments
          if ((layer.yToScreen(0) - (fontHeight + margin)) <= 0) {
            adjustedVerticalPosition = topEdgeVerticalPosition;
          } else if ((layer.yToScreen(0) + (fontHeight + margin)) >= height) {
            adjustedVerticalPosition = bottomEdgeVerticalPosition;
          }

          // left/right adjustments
          if ((layer.xToScreen(v) - metrics.width) <= 0) {
            adjustedHorizontalPosition = leftEdgeHorizontalPosition;
          } else if ((layer.xToScreen(v) + metrics.width) >= layer.xToScreen(xEnd)) {
            adjustedHorizontalPosition = rightEdgeHorizontalPosition;
          }

          // Default to center horizontal adjustment if labels will overlap
          if ((adjustedHorizontalPosition === "right" || adjustedHorizontalPosition === "left")
            && (length >= (gridLength / 2))) {
            adjustedHorizontalPosition = "";
          }
        }

        if (axis === "y") {
          // 0 position adjustment
          if (v === 0) {
            adjustedHorizontalPosition = originHorizontalPosition;
          }

          // top/bottom adjustments
          if ((layer.yToScreen(v) - (fontHeight + margin)) <= 0) {
            adjustedVerticalPosition = topEdgeVerticalPosition;
          } else if ((layer.yToScreen(v) + (fontHeight + margin)) >= height) {
            adjustedVerticalPosition = bottomEdgeVerticalPosition;
          }

          // left/right adjustments
          if ((layer.xToScreen(0) - metrics.width) <= 0) {
            adjustedHorizontalPosition = leftEdgeHorizontalPosition;
          } else if ((layer.xToScreen(v) + fontHeight) >= layer.xToScreen(xEnd)) {
            adjustedHorizontalPosition = rightEdgeHorizontalPosition;
          }
        }

        const { textBaseline, textAlign, xMargin, yMargin } = this.getPositionContexts({
          position: adjustedVerticalPosition + adjustedHorizontalPosition,
          margin,
        });

        // out of range y adjustment
        let adjustedScreenY = layer.yToScreen(0);
        let adjustedScreenX = layer.xToScreen(0);
        let adjustedStyle = style;

        if (axis === "x") {
          if (layer.yToScreen(0) <= 0) {
            adjustedScreenY = 0;
            adjustedStyle = outOfRangeStyle;
          } else if (layer.yToScreen(0) >= height) {
            adjustedScreenY = height;
            adjustedStyle = outOfRangeStyle;
          }
        }

        if (axis === "y") {
          if (layer.xToScreen(0) <= 0) {
            adjustedScreenX = 0;
            adjustedStyle = outOfRangeStyle;
            adjustedIsHidden = (v === 0) ? false : adjustedIsHidden;
          } else if (layer.xToScreen(0) >= width) {
            adjustedScreenX = width;
            adjustedStyle = outOfRangeStyle;
            adjustedIsHidden = (v === 0) ? false : adjustedIsHidden;
          }
        }

        const xSignOffset = (axis === "x") && (v < 0) ? xSignAdjust : 0;
        const yTextOffset = yMargin;
        const xTextOffset = xMargin + xSignOffset;
        const currentX = (axis === "x") ? layer.xToScreen(v) + xTextOffset
          : adjustedScreenX + xTextOffset;
        const currentY = (axis === "x") ? adjustedScreenY + yTextOffset
          : layer.yToScreen(v) + yTextOffset;

        return {
          currentX,
          currentY,
          text,
          metrics,
          xTextOffset,
          yTextOffset,
          textBaseline,
          textAlign,
          isHidden: adjustedIsHidden,
          style: adjustedStyle,
        };
      });

      labels.filter(l => !l.isHidden)
        .forEach((label) => {
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
