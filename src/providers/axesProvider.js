import Utils from "../utils";
import ShapesProvider from "./shapesProvider";
import Arrowhead from "../shapes/arrowhead";

export default class AxesProvider {
  constructor(args) {
    this.ctx = args.ctx;
    this.calcs = args.calcs;
    this.layer = args.layer;
  }

  draw({
    axis = "x",
  } = {}) {
    const { ctx, calcs, layer } = this;
    const {
      xAxis,
      yAxis,
      xStart,
      xEnd,
      yStart,
      yEnd,
    } = calcs;

    ctx.beginPath();

    if (axis === "x" && xAxis.show) {
      ctx.strokeStyle = yAxis.style;
      ctx.lineWidth = yAxis.width;
      const { lineWidth } = ctx;
      ctx.moveTo(Utils.adjust(layer.xToScreen(xStart), lineWidth),
        Utils.adjust(layer.yToScreen(0), lineWidth));
      ctx.lineTo(Utils.adjust(layer.xToScreen(xEnd), lineWidth),
        Utils.adjust(layer.yToScreen(0), lineWidth));

      ctx.lineWidth = 1;
      const arrowheadRight = new Arrowhead({ width: 15, height: 15, direction: "right" });
      arrowheadRight.pos(layer.xToScreen(xEnd) - 15, layer.yToScreen(0) - 7.5);

      const arrowheadLeft = new Arrowhead({ width: 15, height: 15, direction: "left" });
      arrowheadLeft.pos(layer.xToScreen(xStart), layer.yToScreen(0) - 7.5);

      const arrowheadTop = new Arrowhead({ width: 15, height: 15, direction: "top" });
      arrowheadTop.pos(layer.xToScreen(0) - 7.5, layer.yToScreen(yEnd));

      const arrowheadBottom = new Arrowhead({ width: 15, height: 15, direction: "bottom" });
      arrowheadBottom.pos(layer.xToScreen(0) - 7.5, layer.yToScreen(yStart) - 15);

      const shapesProv = new ShapesProvider({ ctx });
      shapesProv.draw(arrowheadRight);
      shapesProv.draw(arrowheadLeft);
      shapesProv.draw(arrowheadTop);
      shapesProv.draw(arrowheadBottom);
    }

    if (axis === "y" && yAxis.show) {
      ctx.strokeStyle = yAxis.style;
      ctx.lineWidth = yAxis.width;
      const { lineWidth } = ctx;
      ctx.moveTo(Utils.adjust(layer.xToScreen(0), lineWidth),
        Utils.adjust(layer.yToScreen(yStart), lineWidth));
      ctx.lineTo(Utils.adjust(layer.xToScreen(0), lineWidth),
        Utils.adjust(layer.yToScreen(yEnd), lineWidth));
    }
    ctx.stroke();
  }
}
