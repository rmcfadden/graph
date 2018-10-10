export default class ShapesProvider {
  constructor(args) {
    this.ctx = args && args.ctx;
  }

  draw(shape) {
    const { ctx } = this;
    const { points } = shape;
    if (points.length < 2) { return; }
    ctx.beginPath();
    const p1 = points[0];
    ctx.moveTo(p1.x, p1.y);
    if (points.length === 1) {
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      return;
    }

    points.slice(1).forEach((p) => {
      ctx.lineTo(p.x, p.y);
    });

    ctx.stroke();
  }
}
