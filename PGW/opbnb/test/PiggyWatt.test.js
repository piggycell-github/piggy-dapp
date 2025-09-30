const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PiggyWatt - Ultimate Optimization Version", function () {
  let PiggyWattFactory;
  let PiggyWatt;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    PiggyWattFactory = await ethers.getContractFactory("PiggyWatt");
    PiggyWatt = await PiggyWattFactory.deploy();
    await PiggyWatt.waitForDeployment();
  });

  describe("Basic Information", function () {
    it("Should have correct name, symbol, and decimals", async function () {
      expect(await PiggyWatt.name()).to.equal("Piggy Watt");
      expect(await PiggyWatt.symbol()).to.equal("PIGGY");
      expect(await PiggyWatt.decimals()).to.equal(0);
    });

    it("Initial total supply should be 0", async function () {
      expect(await PiggyWatt.totalSupply()).to.equal(0);
    });
  });

  describe("Minting & Burning Tests", function () {
    it("Mint function test", async function () {
      const tx = await PiggyWatt.mint(addr1.address, 100);
      const receipt = await tx.wait();

      console.log(`Mint gas cost: ${receipt.gasUsed.toString()}`);

      expect(await PiggyWatt.balanceOf(addr1.address)).to.equal(100);
      expect(await PiggyWatt.totalSupply()).to.equal(100);
    });

    it("Burn function test", async function () {
      // First mint
      await PiggyWatt.mint(addr1.address, 100);

      // Then burn
      const tx = await PiggyWatt.burn(addr1.address, 50);
      const receipt = await tx.wait();

      console.log(`Burn gas cost: ${receipt.gasUsed.toString()}`);

      expect(await PiggyWatt.balanceOf(addr1.address)).to.equal(50);
      expect(await PiggyWatt.totalSupply()).to.equal(50);
    });

    it("Gas cost performance test", async function () {
      // Measure mint gas cost
      const mintTx = await PiggyWatt.mint(addr1.address, 100);
      const mintReceipt = await mintTx.wait();
      const mintGas = mintReceipt.gasUsed;

      // Measure burn gas cost
      const burnTx = await PiggyWatt.burn(addr1.address, 50);
      const burnReceipt = await burnTx.wait();
      const burnGas = burnReceipt.gasUsed;

      console.log(`\n🚀 Final optimization results:`);
      console.log(`mint gas cost: ${mintGas.toString()}`);
      console.log(`burn gas cost: ${burnGas.toString()}`);

      // Check if gas costs are at reasonable levels
      expect(mintGas).to.be.lessThan(100000); // Less than 100k gas
      expect(burnGas).to.be.lessThan(100000); // Less than 100k gas
    });

    it("Non-owner should not have access", async function () {
      await expect(
        PiggyWatt.connect(addr1).mint(addr2.address, 100)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        PiggyWatt.connect(addr1).burn(addr1.address, 50)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Bulk Processing Performance", function () {
    it("Continuous minting performance test", async function () {
      const iterations = 10;
      const amount = 777;

      console.log(`\n⚡ ${iterations} consecutive mint performance test`);

      let totalGas = 0n;
      for (let i = 0; i < iterations; i++) {
        const tx = await PiggyWatt.mint(addr1.address, amount);
        const receipt = await tx.wait();
        totalGas += receipt.gasUsed;
      }

      const avgGas = totalGas / BigInt(iterations);
      console.log(`Average mint gas cost: ${avgGas.toString()}`);
      console.log(`Total gas cost: ${totalGas.toString()}`);

      expect(await PiggyWatt.balanceOf(addr1.address)).to.equal(
        amount * iterations
      );
      expect(await PiggyWatt.totalSupply()).to.equal(amount * iterations);
    });
  });
});
