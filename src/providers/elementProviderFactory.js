import ProviderFactory from "./providerFactory";
import RectangleElementProvider from "./rectangleElementProvider";
import ImageElementProvider from "./imageElementProvider";
import ArcElementProvider from "./arcElementProvider";
import TextElementProvider from "./textElementProvider";
import LineElementProvider from "./lineElementProvider";
import QuadraticOrLinearSplineProvider from "./quadraticOrLinearSplineProvider";
import BezierCurveSplineProvider from "./bezierCurveSplineProvider";

export default class elementProviderFactory extends ProviderFactory {
  constructor() {
    super();
    this.register("Rect", RectangleElementProvider);
    this.register("Image", ImageElementProvider);
    this.register("Arc", ArcElementProvider);
    this.register("Text", TextElementProvider);
    this.register("Line", LineElementProvider);
    this.register("QuadraticSpline", QuadraticOrLinearSplineProvider);
    this.register("LinearSpline", QuadraticOrLinearSplineProvider);
    this.register("BezierCurve", BezierCurveSplineProvider);
  }
}
