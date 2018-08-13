import Utils from "./utils";
import Calcs from "./calcs"

export default class GraphCalcs extends Calcs {
  constructor(args) {
    super(args);
    this.xAxis = args.xAxis;
    this.yAxis = args.yAxis;
    this.xMid = args.xMid;
    this.yMid = args.yMid;
    this.xDistance = args.xDistance;
    this.yDistance = args.yDistance;
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
