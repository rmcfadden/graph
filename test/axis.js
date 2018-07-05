import Axis from "../src/axis.js";
import should from "should";

describe('Axis', () => {
  describe('constructor', () => {    
    it('should have default fields after construction', () => {
      const axis = new Axis();
      should.exist(axis);
      should.equal(-5.5, axis.start);
      should.equal(5.5, axis.end);
      should(axis.show).be.true();
      should.equal(1, axis.width);
      should.equal("black", axis.style);      
    });
  });
});