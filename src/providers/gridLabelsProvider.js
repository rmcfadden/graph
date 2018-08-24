import LabelFormatter from "../formatters/labelFormatter";

export default class GridLabelsProvider {
  constructor(args) {
    this.ctx = args.ctx;
    this.calcs = args.calcs;
    this.graph = args.graph;
    this.layer = args.layer;

    this.getPositionContexts = (position) => {
      switch(position) {
        case "center": return { textBaseline: "middle", textAlign: "center"};
        case "top": return { textBaseline: "bottom", textAlign: "center"};
        case "bottom": return { textBaseline: "top", textAlign: "center"};
        case "left": return { textBaseline: "middle", textAlign: "right"};
        case "right": return { textBaseline: "middle", textAlign: "left"};
        case "topleft": return { textBaseline: "bottom", textAlign: "right"};
        case "topright": return { textBaseline: "bottom", textAlign: "left"};
        case "bottomleft": return { textBaseline: "top", textAlign: "right"};
        case "bottomright": return { textBaseline: "top", textAlign: "left"};
        default : { throw new Error(`Unknown position ${position} provided`); }
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
    const { labelHeight, labelFont, labelPosition } = grid;

    ctx.lineWidth = xAxis.width;

    if (grid.showLabels) {
      const range = isMajor ? xRangeAdjusted : xRangeMinorAdjusted;

      ctx.strokeStyle = config.backgroundStyle;
      ctx.fillStyle = grid.labelStyle;

      const xSignAdjust = ctx.measureText("-").width / 2.0;
            
      const useExponential 
        = (range.find(p => LabelFormatter.shouldFormatExponential(p)) !== undefined);        
      const formatter = new LabelFormatter({useExponential: useExponential});

      ctx.lineWidth = 3; // StrokeWidth
      ctx.font = `${labelHeight}px ${labelFont}`;

      const labelInfos = range.map( x => {
        const label = formatter ? formatter.format(x) : x;
        const labelMetrics = ctx.measureText(label);
        const xTextOffset = 0;
        const yTextOffset = 0;
        return {
          label,
          labelMetrics,
          xTextOffset,
          yTextOffset,
        };
      });

      const { textBaseline, textAlign } = this.getPositionContexts(labelPosition);
      range.forEach((p, i) => {
        if (isXAxis) {
          
          const pFormatted = formatter ? formatter.format(p) : p;
          const textMetrics = ctx.measureText(pFormatted);
          
          let xTextOffset = 0;
          if (p < 0) {
            xTextOffset += xSignAdjust;
          }

          ctx.textBaseline = textBaseline;
          ctx.textAlign = textAlign;

          let currentX = layer.xToScreen(p) - xTextOffset;
          const currentY = layer.yToScreen(0);
          
          let isInScreenBounds = layer.isInScreenBounds({ x: currentX, y: currentY })
            && layer.isInScreenBounds({ x: layer.xToScreen(p) + xTextOffset, y: currentY });

          if (i === 0 && !isInScreenBounds) {
            ctx.textBaseline = "top";
            ctx.textAlign = "left";
            isInScreenBounds = true;
          }

          if (i === range.length -1 && !isInScreenBounds) {
            ctx.textBaseline = "top";
            ctx.textAlign = "right";
            isInScreenBounds = true;
          }


          if (isInScreenBounds) {
            ctx.strokeText(pFormatted, currentX, currentY);
            ctx.fillText(pFormatted, currentX, currentY);
          }
        }
      });
    }
  }
}
