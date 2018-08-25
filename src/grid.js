import Label from "./label";

export default class Grid {
  constructor({
    type = "grid",
    show = true,
    style = "grey",
    step = 1,
    width = 0.5,
  } = {}) {
    this.type = type;
    this.show = show;
    this.style = style;
    this.step = step;
    this.width = width;
    this.label = new Label();
  }
}
