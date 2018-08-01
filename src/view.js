import Layer from "./layer";
import ZoomInSvg from "./images/zoom_in-24px.svg";
import ZoomOutSvg from "./images/zoom_out-24px.svg";
import SettingsSvg from "./images/settings-20px.svg";

export default class View {
  constructor(graph) {
    this.graph = graph;
    this.isMouseDown = false;
    this.startCoords = { x: 0, y: 0 };
    this.lastCoords = { x: 0, y: 0 };
    this.elements = [];

    this.drawSvgImage = (ctx, src, x, y, w, h, name) => {
      const image = new Image();
      image.onload = () => ctx.drawImage(image, x, y, w, h);
      image.src = `data:image/svg+xml; charset=utf-8, ${src}`;
      this.elements.push({
        left: x,
        top: y,
        width: w,
        height: h,
        element: image,
        name,
      });
    };

    this.graph.canvasId = `canvas-${graph.id}`;

    const graphElement = document.getElementById(this.graph.id);
    graphElement.style.position = "relative";
    graphElement.innerHTML = `<canvas id='${this.graph.canvasId}-top' style='position: absolute; left: 0; top: 0; z-index: 2;'></canvas>`
      + `<canvas id='${this.graph.canvasId}' style='position: absolute; left: 0; top: 0; z-index: 1;'></canvas>`;

    this.canvas = document.getElementById(this.graph.canvasId);
    this.ctx = this.canvas.getContext("2d");

    this.canvasTop = document.getElementById(`${this.graph.canvasId}-top`);
    this.ctxTop = this.canvasTop.getContext("2d");

    this.layers = { default: new Layer(this) };

    graphElement.onmousedown = (e) => {
      this.isMouseDown = true;
      const { x, y } = this.lastCoords;
      const startX = e.offsetX - x;
      const startY = e.offsetY - y;
      this.startCoords = { x: startX, y: startY };
    };

    graphElement.onmouseup = (e) => {
      this.isMouseDown = false;
      const { x, y } = this.startCoords;
      const lastX = e.offsetX - x;
      const lastY = e.offsetY - y;
      this.lastCoords = { x: lastX, y: lastY };
    };

    graphElement.onmousemove = (e) => {
      if (!this.isMouseDown) { return; }

      const { x, y } = this.startCoords;
      const diffX = e.offsetX - x;
      const diffY = y - e.offsetY;
      const { transform } = this.graph.config;
      const { xScale, yScale } = transform;
      const {
        xDistance,
        yDistance,
        width,
        height,
      } = this.getSelectedLayer().calcs;

      const changeX = diffX / width;
      const changeY = diffY / height;
      const xOffset = xDistance * changeX / xScale;
      const yOffset = yDistance * changeY / yScale;

      transform.xOffset = xOffset;
      transform.yOffset = yOffset;

      this.draw();
    };

    graphElement.onmousewheel = (e) => {
      const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
      if (delta > 0) {
        this.ZoomIn();
      } else {
        this.ZoomOut();
      }
    };

    graphElement.ontouchstart = () => {
    };

    graphElement.ontouchmove = () => {
    };

    graphElement.ontouchend = () => {
    };

    this.canvasTop.onclick = (e) => {
      const x = e.pageX - this.canvasTop.offsetLeft;
      const y = e.pageY - this.canvasTop.offsetTop;
      this.elements.forEach((element) => {
        if (x >= element.left && y >= element.top
          && x <= element.left + element.width && y <= element.top + element.height) {
          switch (element.name) {
          case "zoomin": { this.ZoomIn(); break; }
          case "zoomout": { this.ZoomOut(); break; }
          case "settings": { break; }
          default: { alert("Action now found"); }
          }
        }
      });
    };

    this.getSelectedLayer = () => this.layers.default; // default for now

    window.onresize = () => {
      this.adjustLayout();
      this.draw();
      this.drawTop();
    };
    window.onorientationchange = window.onresize;

    this.adjustLayout();
    this.draw();
    this.drawTop();
  }

  adjustLayout() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvasTop.width = window.innerWidth;
    this.canvasTop.height = window.innerHeight;
  }

  drawTop() {
    this.ctxTop.clearRect(0, 0, this.canvasTop.width, this.canvasTop.height);
    const l = 35;
    const m = 5;
    const left = this.canvasTop.width - (m + l);

    this.drawSvgImage(this.ctxTop, ZoomInSvg, left, m, l, l, "zoomin");
    this.drawSvgImage(this.ctxTop, ZoomOutSvg, left, l + m, l, l, "zoomout");
    this.drawSvgImage(this.ctxTop, SettingsSvg, left, (l * 2) + m, l, l, "settings");
  }

  ZoomIn() {
    this.StartZoomAnimated(0.5);
  }

  ZoomOut() {
    this.StartZoomAnimated(2.0);
  }

  StartZoomAnimated(scale) {
    const { transform } = this.graph.config;
    const endXScale = transform.xScale * scale;
    const endYScale = transform.yScale * scale;
    this.ZoomAnimated({
      startXScale: transform.xScale,
      startYScale: transform.yScale,
      endXScale,
      endYScale,
      duration: 250,
    });
  }

  ZoomAnimated(args) {
    requestAnimationFrame((timestamp) => {
      const start = args.start || timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min((elapsed) / args.duration, 1);
      const xScale = args.startXScale + (args.endXScale - args.startXScale) * progress;
      const yScale = args.startYScale + (args.endYScale - args.startYScale) * progress;
      this.Zoom({ xScale, yScale });

      if (elapsed < args.duration) {
        this.ZoomAnimated({
          start,
          startXScale: args.startXScale,
          startYScale: args.startYScale,
          duration: args.duration,
          endXScale: args.endXScale,
          endYScale: args.endYScale,
        });
      }
    });
  }

  Zoom(args) {
    const { transform } = this.graph.config;
    const {
      xMid,
      yMid,
    } = this.getSelectedLayer().calcs;

    //transform.xOffset = xMid;
    //transform.yOffset = yMid;

    transform.xScale = args.xScale;
    transform.yScale = args.yScale;
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Object.keys(this.layers).forEach(x => this.layers[x].draw());
  }
}
