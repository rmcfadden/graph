import should from "should";
import Utils from "../src/utils";

describe("Utils", () => {
  describe("distance", () => {
    it("with nonnegative start which is greater than end", () => {
      should(Utils.distance(10, 5)).be.equal(5);
    });

    it("with negative start which is less than end", () => {
      should(Utils.distance(-5, 5)).be.equal(10);
    });

    it("with start which is greater than end", () => {
      should(Utils.distance(5, -5)).be.equal(10);
    });

    it("with start and end euqal ", () => {
      should(Utils.distance(5, 5)).be.equal(0);
    });
  });

  describe("range", () => {
    it("0 to 0", () => {
      should(Utils.range(0, 0)).be.eql([0]);
    });

    it("-5.5 to 5.5", () => {
      should(Utils.range(-5.5, 5.5))
        .be.eql([-5.5, -4.5, -3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5, 4.5, 5.5]);
    });
  });
});
