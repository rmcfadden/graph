import Utils from "./utils";

export default class GraphCalcs {
  constructor(args) {
    this.width = args.width;
    this.height = args.height;
    this.xAxis = args.xAxis;
    this.yAxis = args.yAxis;
    this.xMid = args.xMid;
    this.yMid = args.yMid;
    this.xDistance = args.xDistance;
    this.yDistance = args.yDistance;
    this.xOffset = args.xOffset;
    this.yOffset = args.yOffset;
    this.xScreenScale = args.xScreenScale;
    this.yScreenScale = args.yScreenScale;
    this.xRange = args.xRange;
    this.yRange = args.yRange;
    this.xStart = args.xStart;
    this.xEnd = args.xEnd;
    this.yStart = args.yStart;
    this.yEnd = args.yEnd;
    this.xRangeAdjusted = args.xRangeAdjusted;
    this.yRangeAdjusted = args.yRangeAdjusted;
    this.xRangeMinor = args.xRangeMinor;
    this.yRangeMinor = args.yRangeMinor;
    this.xRangeMinorAdjusted = args.xRangeMinorAdjusted;
    this.yRangeMinorAdjusted = args.yRangeMinorAdjusted;
    this.xMajorStep = args.xMajorStep;
    this.yMajorStep = args.yMajorStep;
    this.xMinorStep = args.xMinorStep;
    this.yMinorStep = args.yMinorStep;
    this.distances = args.distances;  
    this.xToScreen = x => this.xScreenScale * (x + this.xOffset);
    this.yToScreen = y => this.yScreenScale * (this.yOffset - y);
    this.screenToX = x => (x / this.xScreenScale) - this.xOffset;
    this.screenToY = y => this.yOffset - (y / this.yScreenScale);
  
    this.isInBounds = (p) => {
      const { xAxis, yAxis } = this;
      return Utils.isBetween(p.x, xAxis.start, xAxis.end)
        && Utils.isBetween(p.y, yAxis.start, yAxis.end);
    };
  
    this.isInScreenBounds = (p) => {
      const {
        xStart,
        xEnd,
        yStart,
        yEnd,
      } = this;
      return Utils.isBetween(p.x, this.xToScreen(xStart), this.xToScreen(xEnd))
        && Utils.isBetween(p.y, this.yToScreen(yEnd), this.yToScreen(yStart));
    };
  }
}
