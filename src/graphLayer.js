import _ from "lodash";
import Layer from "./layer";
import AxesProvider from "./axesProvider";
import GridProvider from "./gridProvider";
import GridLabelsProvider from "./gridLabelsProvider";

export default class GraphLayer extends Layer {
  constructor(args) {
    super(args);
    this.calcs = null;
  }

  draw() {
    this.drawAxes();
  }

  drawAxes() {
    const { ctx, calcs, graph } = this;

    const gridProv = new GridProvider({
      ctx,
      calcs,
      graph,
      layer: this,
    });

    gridProv.draw({ isMajor: false });
    gridProv.draw({ axisDirection: "y", isMajor: false });
    gridProv.draw();
    gridProv.draw({ axisDirection: "y" });

    const axesProv = new AxesProvider({
      ctx,
      calcs,
      layer: this,
    });
    axesProv.draw();

    const labelsProv = new GridLabelsProvider({
      ctx,
      calcs,
      graph,
      layer: this,
    });
    labelsProv.draw();
  }
}
