import ZoomInSvg from "./images/zoom_in-24px.svg";
import ZoomOutSvg from "./images/zoom_out-24px.svg";
import SettingsSvg from "./images/settings-20px.svg";

export default class TopLayer {
  constructor(view) {
    this.view = view;
    this.graph = view.graph;
    this.canvas = document.getElementById(`${this.graph.canvasId}-top`);
    this.ctx = this.canvas.getContext("2d");

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

    this.canvas.onmousedown = (e) => {
      this.isMouseDown = true;
      const { x, y } = this.lastCoords;
      const startX = e.offsetX - x;
      const startY = e.offsetY - y;
      this.startCoords = { x: startX, y: startY };
    };
  
    this.canvas.onmouseup = (e) => {
      this.isMouseDown = false;
      const { x, y } = this.startCoords;
      const lastX = e.offsetX - x;
      const lastY = e.offsetY - y;
      this.lastCoords = { x: lastX, y: lastY };
    };

    this.canvas.onclick = (e) => {
      const x = e.pageX - this.canvas.offsetLeft;
      const y = e.pageY - this.canvas.offsetTop;
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

    this.canvas.onmousemove = (e) => {
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
      } = this.graph.calcs;

      const changeX = diffX / width;
      const changeY = diffY / height;
      const xOffset = xDistance * changeX / xScale;
      const yOffset = yDistance * changeY / yScale;

      transform.xOffset = xOffset;
      transform.yOffset = yOffset;

      this.view.draw();
    };

    this.canvas.onmousewheel = (e) => {
      const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
      if (delta > 0) {
        this.ZoomIn();
      } else {
        this.ZoomOut();
      }
    };

    this.canvas.ontouchstart = () => {
    };

    this.canvas.ontouchmove = () => {
    };

    this.canvas.ontouchend = () => {
    };
  }



  draw() {
    //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const l = 35;
    const m = 5;
    const left = this.canvas.width - (m + l);
    this.elements = [];
    this.drawSvgImage(this.ctx, ZoomInSvg, left, m, l, l, "zoomin");
    this.drawSvgImage(this.ctx, ZoomOutSvg, left, l + m, l, l, "zoomout");
    this.drawSvgImage(this.ctx, SettingsSvg, left, (l * 2) + m, l, l, "settings");
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
    //transform.xOffset = xMid;
    //transform.yOffset = yMid;

    transform.xScale = args.xScale;
    transform.yScale = args.yScale;
    this.view.draw();
  }
}