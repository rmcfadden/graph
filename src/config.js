import AutoGridConfig from "./autoGridConfig";
import Axis from "./axis";
import Grid from "./grid";
import Labels from "./labels";

export default class Config {
  constructor() {
    this.title = "";
    this.borderStyle = "black";
    this.borderWidth = 1;
    this.backgroundStyle = "white";
    this.useAutoGrid = true;
    this.drawOffScreen = false;

    this.autoGrid = new AutoGridConfig();
    this.axes = {
      x: new Axis(),
      y: new Axis({
        start: -3.5,
        end: 3.5,
        majorGrid: new Grid({
          step: 0.5,
          style: "#000000",
          labels: new Labels({
            verticalPosition: "",
            horizontalPosition: "left",
            showZero: false,
          }),
        }),
      }),
    };
    this.transform = {
      xScale: 1.0,
      yScale: 1.0,
      xOffset: 0,
      yOffset: 0,
    };
  }
}
