import LabelFormatter from "../formatters/labelFormatter";

export default class GridLabelsProvider {
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
    const { labelHeight, labelFont } = grid;

    ctx.lineWidth = xAxis.width;

    if (grid.showLabels) {
      const range = isMajor ? xRangeAdjusted : xRangeMinorAdjusted;

      ctx.strokeStyle = config.backgroundStyle;
      ctx.fillStyle = grid.labelStyle;

      const xSignAdjust = ctx.measureText("-").width / 2.0;
      
      
      const useExponential 
        = (range.find(p => LabelFormatter.shouldFormatExponential(p)) !== undefined);        
      const formatter = new LabelFormatter({useExponential: useExponential});

      ctx.lineWidth = 4; // StrokeWidth
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

      range.forEach((p, i) => {
        if (isXAxis) {
          
          const pFormatted = formatter ? formatter.format(p) : p;
          const textMetrics = ctx.measureText(pFormatted);
          let xTextOffset = 0; //(textMetrics.width / 2.0);
          
          if (p < 0) {
            xTextOffset += xSignAdjust;
          }

          if (p === 0) {
            //xTextOffset += (labelHeight / 2.0);
          }

          let yTextOffset = -1 * labelHeight * 1.25;
          
          //xTextOffset = 0;
          yTextOffset = 0;

          ctx.textBaseline="top";
          ctx.textAlign="center";

          let currentX = layer.xToScreen(p) - xTextOffset;
          const currentY = layer.yToScreen(0) - yTextOffset;

          
          // TODO: test offset here

          let isInScreenBounds = layer.isInScreenBounds({ x: currentX, y: currentY })
            && layer.isInScreenBounds({ x: layer.xToScreen(p) + xTextOffset, y: currentY });

          if (i === 0 && !isInScreenBounds) {
            //currentX += xTextOffset + xSignAdjust;
            isInScreenBounds = true;
          }

          if (i === range.length -1 && !isInScreenBounds) {
            //currentX -= xTextOffset;
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
