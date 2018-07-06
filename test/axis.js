import should from "should";
import Axis from "../src/axis";

describe("Axis", () => {
  describe("constructor", () => {
    it("should have default fields equal to after construction", () => {
      const axis = new Axis();
      should.exist(axis);
      should.equal(-5.5, axis.start);
      should.equal(5.5, axis.end);
      should(axis.show).be.true();
      should.equal(1, axis.width);
      should.equal("black", axis.style);
      should.equal(0, axis.offset);

      should.exist(axis.majorGrid);
      should.equal(0.5, axis.majorGrid.step);
      should.equal("darkgrey", axis.majorGrid.style);
      should(axis.majorGrid.showLabels).be.true();
      should.exist(axis.minorGrid);
      should.equal(0.1, axis.minorGrid.step);
      should.equal("lightgrey", axis.minorGrid.style);
      should(axis.minorGrid.showLabels).be.false();
    });
  });

  describe("getAdjustedStart", () => {
    it("should be equal to", () => {
      const axis = new Axis();
      should.equal(-5.5, axis.getAdjustedStart());
      axis.offset = 5;
      should.equal(-0.5, axis.getAdjustedStart());
    });
  });

  describe("getAdjustedEnd", () => {
    it("should be equal to", () => {
      const axis = new Axis();
      should.equal(5.5, axis.getAdjustedEnd());
      axis.offset = 20.1;
      should.equal(25.6, axis.getAdjustedEnd());
    });
  });
});
