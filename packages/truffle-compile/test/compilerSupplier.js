const assert = require("assert");
const sinon = require("sinon");
const fs = require("fs");
const CompilerSupplier = require("../compilerSupplier");
let expectedResult, expectedFileName, supplier, config;

describe("CompilerSupplier", () => {
  describe("prototype.load()", () => {
    describe("when a docker tag is specified in the config", () => {
      beforeEach(() => {
        config = {
          docker: "randoDockerTagzzz",
          version: "0.4.25"
        };
        supplier = new CompilerSupplier(config);
        sinon.stub(supplier, "getBuilt");
      });
      afterEach(() => {
        supplier.getBuilt.restore();
      });

      it("calls getBuilt with 'docker' as an argument", done => {
        supplier.load().then(() => {
          assert(supplier.getBuilt.calledWith("docker"));
          done();
        });
      });
    });

    describe(`when the version is set to a specific word I can't write here`, () => {
      // HACK: Because of how the test script is set up, the word 'native' cannot be a
      // part of the it/describe strings above and below
      beforeEach(() => {
        config = { version: "native" };
        supplier = new CompilerSupplier(config);
        sinon.stub(supplier, "getBuilt");
      });
      afterEach(() => {
        supplier.getBuilt.restore();
      });

      it("calls getBuilt with that specific word as an argument", done => {
        supplier.load().then(() => {
          assert(supplier.getBuilt.calledWith("native"));
          done();
        });
      });
    });

    describe("when no version is specified in the config", () => {
      beforeEach(() => {
        supplier = new CompilerSupplier();
        sinon.stub(supplier, "getBundledSolc");
      });
      afterEach(() => {
        supplier.getBundledSolc.restore();
      });

      it("calls getBundledSolc", done => {
        supplier.load().then(() => {
          assert(supplier.getBundledSolc.called);
          done();
        });
      });
    });

    describe("when a solc version is specified in the config", () => {
      beforeEach(() => {
        config = { version: "0.4.11" };
        supplier = new CompilerSupplier(config);
        sinon.stub(supplier, "getSolcFromVersion");
      });
      afterEach(() => {
        supplier.getSolcFromVersion.restore();
      });

      it("calls getSolcFromVersion with the version number", done => {
        supplier.load().then(() => {
          assert(supplier.getSolcFromVersion.calledWith("0.4.11"));
          done();
        });
      });
    });

    describe("when a solc version range is specified", () => {
      beforeEach(() => {
        config = { version: "^0.4.11" };
        supplier = new CompilerSupplier(config);
        sinon.stub(supplier, "getSolcFromVersionRange");
      });
      afterEach(() => {
        supplier.getSolcFromVersionRange.restore();
      });

      it("calls getSolcFromVersion with the version range", done => {
        supplier.load().then(() => {
          assert(supplier.getSolcFromVersionRange.calledWith("^0.4.11"));
          done();
        });
      });
    });

    describe("when no valid values are specified", () => {
      beforeEach(() => {
        config = { version: "globbity gloop" };
        supplier = new CompilerSupplier(config);
      });

      it("throws an error", done => {
        supplier
          .load()
          .then(() => {
            assert(false);
            done();
          })
          .catch(error => {
            let expectedMessageSnippet = "version matching globbity gloop";
            assert(error.message.includes(expectedMessageSnippet));
            done();
          });
      });
    });
  });

  describe("prototype.versionIsCached(version)", () => {
    beforeEach(() => {
      const compilerFileNames = [
        "soljson-v0.4.22+commit.124ca40d.js",
        "soljson-v0.4.11+commit.124234rd.js",
        "soljson-v0.4.23+commit.1534a40d.js"
      ];
      sinon.stub(fs, "readdirSync").returns(compilerFileNames);
    });
    afterEach(() => {
      fs.readdirSync.restore();
    });

    describe("when a cached version of the compiler is present", () => {
      beforeEach(() => {
        expectedResult = "v0.4.11+commit.124234rd.js";
      });

      it("returns the file name with the prefix removed", () => {
        assert.equal(
          CompilerSupplier.prototype.versionIsCached("0.4.11"),
          expectedResult
        );
      });
    });
    describe("when a cached version of the compiler is not present", () => {
      beforeEach(() => {
        expectedResult = undefined;
      });

      it("returns undefined", () => {
        assert.equal(
          CompilerSupplier.prototype.versionIsCached("0.4.29"),
          expectedResult
        );
      });
    });
  });

  describe("prototype.getCached(version)", () => {
    beforeEach(() => {
      const compilerFileNames = [
        "soljson-v0.4.22+commit.124ca40d.js",
        "soljson-v0.4.23+commit.1534a40d.js",
        "soljson-v0.4.11+commit.124234rd.js"
      ];
      sinon.stub(fs, "readdirSync").returns(compilerFileNames);
    });
    afterEach(() => {
      fs.readdirSync.restore();
    });

    describe("when there is only one valid compiler file", () => {
      beforeEach(() => {
        expectedFileName = "soljson-v0.4.11+commit.124234rd.js";
        sinon
          .stub(CompilerSupplier.prototype, "getFromCache")
          .withArgs(expectedFileName)
          .returns("correct return");
      });
      afterEach(() => {
        CompilerSupplier.prototype.getFromCache.restore();
      });

      it("calls getFromCache and returns the result", () => {
        assert(
          CompilerSupplier.prototype.getCached("0.4.11"),
          "correct return"
        );
      });
    });

    describe("when there are multiple valid compiler files", () => {
      beforeEach(() => {
        expectedFileName = "soljson-v0.4.23+commit.1534a40d.js";
        sinon
          .stub(CompilerSupplier.prototype, "getFromCache")
          .withArgs(expectedFileName)
          .returns("correct return");
      });
      afterEach(() => {
        CompilerSupplier.prototype.getFromCache.restore();
      });

      it("calls getFromCache with the most recent compiler version and returns the result", () => {
        assert.equal(
          CompilerSupplier.prototype.getCached("^0.4.15"),
          "correct return"
        );
      });
    });
  });
});
