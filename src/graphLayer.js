import Layer from "./layer";
import AxesProvider from "./providers/axesProvider";
import GridProvider from "./providers/gridProvider";
import GridLabelsProvider from "./providers/gridLabelsProvider";

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
    gridProv.draw({ axis: "y", isMajor: false });
    gridProv.draw();
    gridProv.draw({ axis: "y" });

    const axesProv = new AxesProvider({
      ctx,
      calcs,
      layer: this,
    });
    axesProv.draw();
    axesProv.draw({ axis: "y" });

    const labelsProv = new GridLabelsProvider({
      ctx,
      calcs,
      graph,
      layer: this,
    });
    labelsProv.draw();
    labelsProv.draw({ axis: "y" });
  }
}
