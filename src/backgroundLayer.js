import Layer from "./layer";

export default class BackgroundLayer extends Layer {
  constructor(args) {
    super(args);
    this.calcs = null;
  }

  draw() {
    this.drawBackground();
  }

  drawBackground() {
    const { backgroundStyle, borderStyle, borderWidth } = this.graph.config;
    const { width, height } = this.canvas;
    const { ctx } = this;
    ctx.fillStyle = backgroundStyle;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = borderStyle;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(0, 0, width, height);
  }
}
