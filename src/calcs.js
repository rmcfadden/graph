import Utils from "./utils";

export default class Calcs {
  constructor(args) {
    if(args) {
      this.width = args.width;
      this.height = args.height;
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
    }
  }
}
