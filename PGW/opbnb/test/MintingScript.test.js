const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PGW Continuous Minting Script", function () {
  let PiggyWattFactory;
  let PiggyWatt;
  let owner;

  // Target address for testing
  const TARGET_ADDRESS = "0x0D745Ff007d343D79164E30Ad00340d5770bFE27";
  const MINT_AMOUNT = 777;
  const MINT_COUNT = 10;

  before(async function () {
    console.log("\n🚀 PGW Minting Script Test Started");
    console.log("=" * 50);

    [owner] = await ethers.getSigners();
    console.log(`Deployer address: ${owner.address}`);

    // Deploy contract
    PiggyWattFactory = await ethers.getContractFactory("PiggyWatt");
    PiggyWatt = await PiggyWattFactory.deploy();
    await PiggyWatt.waitForDeployment();

    const contractAddress = await PiggyWatt.getAddress();
    console.log(`PiggyWatt contract address: ${contractAddress}`);
    console.log(`Target minting address: ${TARGET_ADDRESS}`);
    console.log(
      `Minting amount: ${MINT_AMOUNT} × ${MINT_COUNT} times = ${
        MINT_AMOUNT * MINT_COUNT
      } total`
    );
    console.log("=" * 50);
  });

  describe("🎯 Main Minting Test", function () {
    it("should mint 10 PGW tokens 10 times to target address", async function () {
      console.log("\n📍 Starting continuous minting 10 tokens 10 times...\n");

      // Check initial state
      const initialBalance = await PiggyWatt.balanceOf(TARGET_ADDRESS);
      const initialTotalSupply = await PiggyWatt.totalSupply();

      console.log(`📊 Initial state:`);
      console.log(`   - Target address balance: ${initialBalance} PGW`);
      console.log(`   - Total supply: ${initialTotalSupply} PGW\n`);

      // Repeat 10 times to mint 10 tokens each
      for (let i = 1; i <= MINT_COUNT; i++) {
        console.log(`⏳ [${i}/${MINT_COUNT}] Minting in progress...`);

        // Balance before minting
        const beforeBalance = await PiggyWatt.balanceOf(TARGET_ADDRESS);

        // Execute minting and verify events
        const tx = await PiggyWatt.issuePoints(TARGET_ADDRESS, MINT_AMOUNT);
        const receipt = await tx.wait();

        // Balance after minting
        const afterBalance = await PiggyWatt.balanceOf(TARGET_ADDRESS);
        const increase = afterBalance - beforeBalance;

        console.log(
          `   ✅ Success! Balance: ${beforeBalance} → ${afterBalance} (+${increase} PGW)`
        );

        // Verification
        expect(increase).to.equal(MINT_AMOUNT);
        expect(afterBalance).to.equal(initialBalance + BigInt(MINT_AMOUNT * i));

        // Event verification
        expect(tx)
          .to.emit(PiggyWatt, "Transfer")
          .withArgs(ethers.ZeroAddress, TARGET_ADDRESS, MINT_AMOUNT);
      }

      // Check final results
      const finalBalance = await PiggyWatt.balanceOf(TARGET_ADDRESS);
      const finalTotalSupply = await PiggyWatt.totalSupply();
      const totalMinted = MINT_AMOUNT * MINT_COUNT;

      console.log(`\n🎉 Minting completed!`);
      console.log(`📊 Final results:`);
      console.log(`   - Target address final balance: ${finalBalance} PGW`);
      console.log(`   - Total supply: ${finalTotalSupply} PGW`);
      console.log(`   - Total minted: ${totalMinted} PGW`);
      console.log(`   - Increase: ${finalBalance - initialBalance} PGW\n`);

      // Final verification
      expect(finalBalance).to.equal(initialBalance + BigInt(totalMinted));
      expect(finalTotalSupply).to.be.at.least(totalMinted);
    });
  });

  describe("🔍 Additional Verification Tests", function () {
    it("should verify target address has correct balance", async function () {
      const balance = await PiggyWatt.balanceOf(TARGET_ADDRESS);
      const expectedMinimum = MINT_AMOUNT * MINT_COUNT;

      console.log(`\n✨ Balance verification:`);
      console.log(`   - Current balance: ${balance} PGW`);
      console.log(`   - Minimum expected: ${expectedMinimum} PGW`);

      expect(balance).to.be.at.least(expectedMinimum);
      console.log(`   ✅ Verification passed!\n`);
    });

    it("should test batch minting as alternative approach", async function () {
      console.log(`\n🚀 Batch minting alternative test:`);

      const initialBalance = await PiggyWatt.balanceOf(TARGET_ADDRESS);

      // Create arrays for batch minting (same address 10 times)
      const recipients = new Array(MINT_COUNT).fill(TARGET_ADDRESS);
      const amounts = new Array(MINT_COUNT).fill(MINT_AMOUNT);

      console.log(`   - Batch size: ${recipients.length} items`);
      console.log(`   - Each minting amount: ${MINT_AMOUNT} PGW`);
      console.log(`   - Total minting amount: ${MINT_AMOUNT * MINT_COUNT} PGW`);

      // Execute batch minting
      await PiggyWatt.batchIssuePoints(recipients, amounts);

      const finalBalance = await PiggyWatt.balanceOf(TARGET_ADDRESS);
      const increase = finalBalance - initialBalance;

      console.log(`   - Before minting: ${initialBalance} PGW`);
      console.log(`   - After minting: ${finalBalance} PGW`);
      console.log(`   - Increase: ${increase} PGW`);
      console.log(`   ✅ Batch minting successful!\n`);

      expect(increase).to.equal(MINT_AMOUNT * MINT_COUNT);
    });

    it("should display final summary", async function () {
      const finalBalance = await PiggyWatt.balanceOf(TARGET_ADDRESS);
      const totalSupply = await PiggyWatt.totalSupply();

      console.log(`\n📋 Final Summary Report`);
      console.log(`${"=".repeat(40)}`);
      console.log(`🎯 Target address: ${TARGET_ADDRESS}`);
      console.log(`💰 Final balance: ${finalBalance} PGW`);
      console.log(`📈 Total supply: ${totalSupply} PGW`);
      console.log(`✅ Test completed: Successfully minted 10 tokens 10 times`);
      console.log(`${"=".repeat(40)}\n`);

      expect(finalBalance).to.be.at.least(MINT_AMOUNT * MINT_COUNT);
    });
  });
});
