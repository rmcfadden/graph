import Axis from "./axis";
import Utils from "./utils";

export default class Layer {
  constructor(graph) {
    this.graph = graph;
    this.convas = null;
    this.context = null;
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
console.log('Calcs:');           
console.log(this.calcs);           
console.log(`x: ${p.x}, y: ${p.y}`);
console.log(`start x1: ${this.xToScreen(xAxis.start)}, end x2: ${this.xToScreen(xAxis.end)}`);
console.log(`start y1: ${this.yToScreen(yAxis.start)}, end y2: ${this.yToScreen(yAxis.end)}`);
console.log(`x1: ${xAxis.start}, x2: ${xAxis.end}`);
console.log(`y1: ${yAxis.start}, y2: ${yAxis.end}`);
console.log(`----------------------`);
      return Utils.isBetween(p.x, this.xToScreen(xAxis.start), this.xToScreen(xAxis.end)) 
        && Utils.isBetween(p.y,  this.yToScreen(yAxis.end), this.yToScreen(yAxis.start));
    };
  }

  draw() {
    if(!this.graph) { throw new Error('this.graph cannot be empty'); }
    if(!this.graph.canvasId) { throw new Error('this.graph.canvasId cannot be empty'); }
    this.canvas = document.getElementById(this.graph.canvasId);
    this.context = this.canvas.getContext("2d");
    this.preCalculations();
    this.drawBackground();
    this.drawAxes();
  }

  drawBackground() {
    const { backgroundStyle, borderStyle, borderWidth } = this.graph.config;
    const { width, height} = this.canvas;
    const { context } = this;
    
    context.fillStyle = backgroundStyle;
    context.fillRect(0, 0, width, height);
    context.strokeStyle = borderStyle;
    context.lineWidth = borderWidth;
    context.strokeRect(0, 0, width, height);  
  }

  preCalculations() {
    const { config } = this.graph;
    const { width, height} = this.canvas;

    const xAxis = config.axes.x;
    const yAxis = config.axes.y;        
    const xDistance = Utils.distance(xAxis.start, xAxis.end);
    const xMid = xDistance / 2;
    const yDistance = Utils.distance(yAxis.start, yAxis.end);
    const yMid = yDistance / 2;
    const xScale = width / xDistance;
    const yScale = height / yDistance;
    const xOffset = xDistance - xAxis.end;
    const yOffset = yDistance + yAxis.start;

    const xRange = Utils.range(xAxis.start, xAxis.end, xAxis.majorGrid.step);
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
    const { context } = this;
    const { width, height, xAxis, yAxis, xMid, yMid, xDistance, yDistance,xOffset, yOffset } = this.calcs;
 
    context.lineWidth = xAxis.width;

    // Draw gridlines/rulers
    this.drawGrid({xAxis: xAxis, yAxis: yAxis, isMajor: false});  
    this.drawGrid({xAxis: xAxis, yAxis: yAxis, axisDirection: "y", isMajor: false}); 

    this.drawGrid({xAxis: xAxis, yAxis: yAxis});  
    this.drawGrid({xAxis: xAxis, yAxis: yAxis, axisDirection: "y"}); 

    // Draw origin
    context.beginPath();
    context.strokeStyle = xAxis.style || config.borderStyle;        
    context.lineWidth = 1;
    const adjust = this.adjust;

    context.moveTo(adjust(this.xToScreen(xAxis.start)),adjust(this.yToScreen(0)));        
    context.lineTo(adjust(this.xToScreen(xAxis.end)),adjust(this.yToScreen(0)));        
    
    context.moveTo(adjust(this.xToScreen(0)),adjust(this.yToScreen(yAxis.start)));        
    context.lineTo(adjust(this.xToScreen(0)),adjust(this.yToScreen(yAxis.end)));        
    context.stroke();
  }

  drawGrid({xAxis, yAxis, axisDirection = "x", isMajor = true} = {}) {
    const { config } = this.graph;
    const { context, canvas } = this;
    const { xMid, yMid, xRangeAdjusted, yRangeAdjusted, xRangeMinorAdjusted, yRangeMinorAdjusted} = this.calcs; 

    const isXAxis = (axisDirection === "x");
    const axis = isXAxis ?  xAxis : yAxis;
    const secondAxis = isXAxis ?  yAxis : xAxis;
    const grid = isMajor ? axis.majorGrid :  axis.minorGrid;
    const textHeight = grid.textHeight;

    if(grid.show) {
      const originOffset = ((isXAxis ? xMid : yMid) % 1);
      const range = isXAxis ? 
        (isMajor ? xRangeAdjusted : xRangeMinorAdjusted) : 
        (isMajor ? yRangeAdjusted : yRangeMinorAdjusted);
      const distance = Utils.distance(axis.start, axis.end);  
      context.beginPath();
      context.strokeStyle = grid.style || config.borderStyle;
      context.lineWidth  = 1;
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

        context.moveTo(adjust(xStart),adjust(yStart));
        context.lineTo(adjust(xEnd), adjust(yEnd));
      });
      context.stroke();

      // Draw horizontal labels
      context.strokeStyle = config.backgroundStyle;
      context.fillStyle = grid.labelStyle;
      
      let previousX = null;
      let mod = 1;
      
      range.forEach((p,i) => {
//console.log(`p: ${p}, i % modulus = ${(i % modolus)}`);
        const dashWidth = context.measureText('-').width / 2.0;
        if((i % mod) !== 0) { return; }
        if(grid.showLabels){
          if(isXAxis){
            const textMetrics = context.measureText(p);
            let xTextOffset =  (textMetrics.width / 2.0);
            if(p < 0){
              xTextOffset += dashWidth;
            }

            if(p == 0) {
              xTextOffset += (textHeight / 2.0);
            }

            const yTextOffset =  -1 * textHeight;                                          
            context.lineWidth  = 4; // StrokeWidth                  
            context.font = `${textHeight}px Arial`;                  
            
            const currentX = this.xToScreen(p) - xTextOffset;
            const currentY = this.yToScreen(0) - yTextOffset

            if(this.isInScreenBounds({ x: currentX, y: currentY }) && 
              this.isInScreenBounds({ x: this.xToScreen(p) + xTextOffset, y: currentY })) {
              context.strokeText(p, currentX, currentY);
              context.fillText(p, currentX, currentY);
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
