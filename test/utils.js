import should from "should";
import Utils from "../src/utils";

describe("Utils", () => {
  describe("distance", () => {
    it("with nonnegative start which is larger than end should be equal a positive number", () => {
      should(Utils.distance(10, 5)).be.equal(5);
    });
  });
});
