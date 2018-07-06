import Utils from "./utils";

export default class Layer {
  constructor(view) {
    this.view = view;
    this.graph = view.graph;
    this.canvas = this.view.canvas;
    this.ctx = this.view.ctx;
    this.calcs = {};        
    this.xToScreen = (x) => this.calcs.xScale * (x + this.calcs.xOffset);
    this.yToScreen = (y) => this.calcs.yScale * (this.calcs.yOffset - y);
    this.screenToX = (x) => (x / this.calcs.xScale) - this.calcs.xOffset;
    this.screenToY = (y) => this.calcs.yOffset - (y / this.calcs.yScale);

    this.isInBounds = (p) => {
      const {xAxis, yAxis} = this.calcs;
      return Utils.isBetween(p.x, xAxis.start, xAxis.end) && Utils.isBetween(p.y, yAxis.start, yAxis.end);
    }

    this.isInScreenBounds = (p) => {
      const {xAxis, yAxis} = this.calcs;
      return Utils.isBetween(p.x, this.xToScreen(xAxis.start), this.xToScreen(xAxis.end)) 
        && Utils.isBetween(p.y,  this.yToScreen(yAxis.end), this.yToScreen(yAxis.start));
    };
  }

  draw() {
    if(!this.graph) { throw new Error('this.graph cannot be empty'); }
    if(!this.graph.canvasId) { throw new Error('this.graph.canvasId cannot be empty'); }
    this.preCalculations();
    this.drawBackground();
    this.drawAxes();
  }

  drawBackground() {
    const { backgroundStyle, borderStyle, borderWidth } = this.graph.config;
    const { width, height} = this.canvas;
    const { ctx } = this;
    
    ctx.fillStyle = backgroundStyle;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = borderStyle;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(0, 0, width, height);  
  }

  preCalculations() {
    const { config } = this.graph;
    const { width, height} = this.canvas;
    const { x: xAxis, y: yAxis} = config.axes;
    
    const xStart = xAxis.getAdjustedStart();
    const xEnd = xAxis.getAdjustedEnd();    
    
    const xDistance = Utils.distance(xStart, xEnd);
    
    const xMid = xDistance / 2;
    const yDistance = Utils.distance(yAxis.start, yAxis.end);
    const yMid = yDistance / 2;
    const xScale = width / xDistance;
    const yScale = height / yDistance;
    const xOffset = xDistance - xEnd;
    const yOffset = yDistance + yAxis.start;

    const xRange = Utils.range(xStart, xEnd, xAxis.majorGrid.step);
    const yRange = Utils.range(yAxis.start, yAxis.end, yAxis.majorGrid.step);          
    const xRangeAdjusted = Utils.offsetRangeToClosest(xRange, 0);
    const yRangeAdjusted = Utils.offsetRangeToClosest(yRange, 0);

    const xRangeMinor = Utils.range(xAxis.start, xAxis.end, xAxis.minorGrid.step);
    const yRangeMinor = Utils.range(yAxis.start, yAxis.end, yAxis.minorGrid.step);
    const xRangeMinorAdjusted = Utils.offsetRangeToClosest(xRangeMinor, 0);
    const yRangeMinorAdjusted = Utils.offsetRangeToClosest(yRangeMinor, 0);

    this.calcs = {
      width : width,
      height: height,
      xAxis: xAxis,
      yAxis: yAxis,
      xDistance: xDistance,
      yDistance: yDistance,
      xMid: xMid,
      yMid: yMid,
      xOffset: xOffset,
      yOffset: yOffset,
      xScale: xScale,
      yScale: yScale,
      xRange: xRange,
      yRange: yRange,
      xRangeAdjusted: xRangeAdjusted,
      yRangeAdjusted: yRangeAdjusted,
      xRangeMinor: xRangeMinor,
      yRangeMinor: yRangeMinor,
      xRangeMinorAdjusted: xRangeMinorAdjusted,
      yRangeMinorAdjusted: yRangeMinorAdjusted
    };
  }

  drawAxes() {
    const { config } = this.graph;
    const { ctx } = this;
    const { xAxis, yAxis } = this.calcs;
 
    ctx.lineWidth = xAxis.width;

    // Draw gridlines/rulers
    this.drawGrid({xAxis: xAxis, yAxis: yAxis, isMajor: false});  
    this.drawGrid({xAxis: xAxis, yAxis: yAxis, axisDirection: "y", isMajor: false}); 

    this.drawGrid({xAxis: xAxis, yAxis: yAxis});  
    this.drawGrid({xAxis: xAxis, yAxis: yAxis, axisDirection: "y"}); 

    // Draw origin
    ctx.beginPath();
    ctx.strokeStyle = xAxis.style || config.borderStyle;        
    ctx.lineWidth = 1;
    const adjust = this.adjust;

    ctx.moveTo(adjust(this.xToScreen(xAxis.start)),adjust(this.yToScreen(0)));        
    ctx.lineTo(adjust(this.xToScreen(xAxis.end)),adjust(this.yToScreen(0)));        
    
    ctx.moveTo(adjust(this.xToScreen(0)),adjust(this.yToScreen(yAxis.start)));        
    ctx.lineTo(adjust(this.xToScreen(0)),adjust(this.yToScreen(yAxis.end)));        
    ctx.stroke();
  }

  drawGrid({xAxis, yAxis, axisDirection = "x", isMajor = true} = {}) {
    const { config } = this.graph;
    const { ctx } = this;
    const { xRangeAdjusted, yRangeAdjusted, xRangeMinorAdjusted, yRangeMinorAdjusted} = this.calcs; 

    const isXAxis = (axisDirection === "x");
    const axis = isXAxis ?  xAxis : yAxis;
    const secondAxis = isXAxis ?  yAxis : xAxis;
    const grid = isMajor ? axis.majorGrid :  axis.minorGrid;
    const textHeight = grid.textHeight;

    if(grid.show) {
//      const originOffset = ((isXAxis ? xMid : yMid) % 1);
      const range = isXAxis ? 
        (isMajor ? xRangeAdjusted : xRangeMinorAdjusted) : 
        (isMajor ? yRangeAdjusted : yRangeMinorAdjusted);
      //const distance = Utils.distance(axis.start, axis.end);  
      ctx.beginPath();
      ctx.strokeStyle = grid.style || config.borderStyle;
      ctx.lineWidth  = 1;
      const toScreen = isXAxis ? this.yToScreen : this.xToScreen;

      const rulerLength = textHeight  / ((isMajor) ? 2.0 : 4.0);

      range.forEach(p => {
        const fixed = isXAxis ? this.xToScreen(p) : this.yToScreen(p);
        const gridType = "grid";
        const start = (grid.type === gridType) ? toScreen(secondAxis.start)
          : -1 * rulerLength;
        const end = (grid.type === gridType) ? toScreen(secondAxis.end)
          : rulerLength;
        
        const xStart = isXAxis ? fixed : start;
        const xEnd = isXAxis ? fixed : end;
        const yStart = isXAxis ? start : fixed;
        const yEnd = isXAxis ? end : fixed;              
        const adjust = this.adjust;

        ctx.moveTo(adjust(xStart),adjust(yStart));
        ctx.lineTo(adjust(xEnd), adjust(yEnd));
      });
      ctx.stroke();

      // Draw horizontal labels
      ctx.strokeStyle = config.backgroundStyle;
      ctx.fillStyle = grid.labelStyle;
      
      let previousX = null;
      let mod = 1;
      
      range.forEach((p,i) => {
//console.log(`p: ${p}, i % modulus = ${(i % modolus)}`);
        const dashWidth = ctx.measureText('-').width / 2.0;
        if((i % mod) !== 0) { return; }
        if(grid.showLabels){
          if(isXAxis){
            const textMetrics = ctx.measureText(p);
            let xTextOffset =  (textMetrics.width / 2.0);
            if(p < 0){
              xTextOffset += dashWidth;
            }

            if(p == 0) {
              xTextOffset += (textHeight / 2.0);
            }

            const yTextOffset =  -1 * textHeight;                                          
            ctx.lineWidth  = 4; // StrokeWidth                  
            ctx.font = `${textHeight}px Arial`;                  
            
            const currentX = this.xToScreen(p) - xTextOffset;
            const currentY = this.yToScreen(0) - yTextOffset

            if(this.isInScreenBounds({ x: currentX, y: currentY }) && 
              this.isInScreenBounds({ x: this.xToScreen(p) + xTextOffset, y: currentY })) {
                ctx.strokeText(p, currentX, currentY);
                ctx.fillText(p, currentX, currentY);
            }
            previousX = currentX;
          }
        }
      });
    }
  }

  adjust(x) {
    const rounded = parseInt(x);
    return rounded;
  }
}
