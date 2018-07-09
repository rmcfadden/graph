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

    it("with start and end equal ", () => {
      should(Utils.distance(5, 5)).be.equal(0);
    });
  });

  describe("alignRange", () => {
    it("with n = 0", () => {
      should(() => Utils.alignRange([], 0)).throw();
    });

    it("with aligned range", () => {
      should(Utils.alignRange([1, 2, 3, 4], 1))
        .be.eql([1, 2, 3, 4]);
    });

    it("with non aligned range", () => {
      should(Utils.alignRange([1.1, 2.2, 3.3, 4.4], 0.25))
        .be.eql([1, 2.25, 3.25, 4.5]);
    });
  });
});
