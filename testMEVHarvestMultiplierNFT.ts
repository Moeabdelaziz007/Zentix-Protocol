import { expect } from "chai";
import { ethers } from "hardhat";
import { MEVHarvestMultiplierNFT, ZentixMEVHarvester } from "../typechain-types";
import { Signer } from "ethers";

describe("MEVHarvestMultiplierNFT", function () {
  let mevHarvestMultiplierNFT: MEVHarvestMultiplierNFT;
  let mockMEVHarvester: Signer;
  let treasury: Signer;
  let user1: Signer;
  let user2: Signer;
  let deployer: Signer;

  beforeEach(async function () {
    [deployer, mockMEVHarvester, treasury, user1, user2] = await ethers.getSigners();

    // Deploy MEVHarvestMultiplierNFT
    const MEVHarvestMultiplierNFTFactory = await ethers.getContractFactory("MEVHarvestMultiplierNFT");
    mevHarvestMultiplierNFT = await MEVHarvestMultiplierNFTFactory.deploy(
      await mockMEVHarvester.getAddress(),
      await treasury.getAddress()
    );
    await mevHarvestMultiplierNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct MEV Harvester and Treasury addresses", async function () {
      expect(await mevHarvestMultiplierNFT.mevHarvesterAddress()).to.equal(await mockMEVHarvester.getAddress());
      expect(await mevHarvestMultiplierNFT.treasuryAddress()).to.equal(await treasury.getAddress());
    });

    it("Should have bond sale inactive by default", async function () {
      expect(await mevHarvestMultiplierNFT.bondSaleActive()).to.be.false;
    });
  });

  describe("Bond Issuance", function () {
    const bondParams = {
      totalBondsToIssue: 10,
      bondPrice: ethers.parseEther("1"),
      maturityPeriod: 30 * 24 * 60 * 60, // 30 days
      profitSharePercentage: 25
    };

    it("Should allow owner to create bond issuance", async function () {
      await expect(mevHarvestMultiplierNFT.createBondIssuance(bondParams))
        .to.emit(mevHarvestMultiplierNFT, "BondSaleActivated")
        .withArgs(
          bondParams.totalBondsToIssue,
          bondParams.bondPrice,
          bondParams.maturityPeriod,
          bondParams.profitSharePercentage
        );

      expect(await mevHarvestMultiplierNFT.bondSaleActive()).to.be.true;

      const params = await mevHarvestMultiplierNFT.currentBondParams();
      expect(params.totalBondsToIssue).to.equal(bondParams.totalBondsToIssue);
      expect(params.bondPrice).to.equal(bondParams.bondPrice);
      expect(params.maturityPeriod).to.equal(bondParams.maturityPeriod);
      expect(params.profitSharePercentage).to.equal(bondParams.profitSharePercentage);
    });

    it("Should reject bond issuance with invalid parameters", async function () {
      // Test with zero bonds
      await expect(mevHarvestMultiplierNFT.createBondIssuance({
        ...bondParams,
        totalBondsToIssue: 0
      })).to.be.revertedWith("Must issue at least one bond");

      // Test with zero price
      await expect(mevHarvestMultiplierNFT.createBondIssuance({
        ...bondParams,
        bondPrice: 0
      })).to.be.revertedWith("Bond price must be greater than zero");

      // Test with zero maturity
      await expect(mevHarvestMultiplierNFT.createBondIssuance({
        ...bondParams,
        maturityPeriod: 0
      })).to.be.revertedWith("Maturity period must be greater than zero");

      // Test with invalid profit share percentage
      await expect(mevHarvestMultiplierNFT.createBondIssuance({
        ...bondParams,
        profitSharePercentage: 0
      })).to.be.revertedWith("Profit share must be 1-100%");

      await expect(mevHarvestMultiplierNFT.createBondIssuance({
        ...bondParams,
        profitSharePercentage: 101
      })).to.be.revertedWith("Profit share must be 1-100%");
    });
  });

  describe("Bond Purchase", function () {
    const bondParams = {
      totalBondsToIssue: 5,
      bondPrice: ethers.parseEther("1"),
      maturityPeriod: 30 * 24 * 60 * 60, // 30 days
      profitSharePercentage: 25
    };

    beforeEach(async function () {
      await mevHarvestMultiplierNFT.createBondIssuance(bondParams);
    });

    it("Should allow users to purchase bonds", async function () {
      const user1Address = await user1.getAddress();
      const treasuryBalanceBefore = await ethers.provider.getBalance(await treasury.getAddress());

      // User 1 purchases a bond
      await expect(mevHarvestMultiplierNFT.connect(user1).purchaseHarvestBond({
        value: bondParams.bondPrice
      }))
        .to.emit(mevHarvestMultiplierNFT, "HarvestBondCreated")
        .withArgs(1, user1Address, bondParams.bondPrice);

      // Check that the bond was minted to the correct owner
      expect(await mevHarvestMultiplierNFT.ownerOf(1)).to.equal(user1Address);

      // Check that the treasury received the payment
      const treasuryBalanceAfter = await ethers.provider.getBalance(await treasury.getAddress());
      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(bondParams.bondPrice);

      // Check that the bond metadata was set correctly
      const bondMetadata = await mevHarvestMultiplierNFT.getHarvestBond(1);
      expect(bondMetadata.name).to.equal("MEV Harvest Bond #1");
      expect(bondMetadata.profitSharePercentage).to.equal(bondParams.profitSharePercentage);
      expect(bondMetadata.visualState).to.equal("new");
    });

    it("Should fail if insufficient payment is sent", async function () {
      await expect(mevHarvestMultiplierNFT.connect(user1).purchaseHarvestBond({
        value: ethers.parseEther("0.5") // Less than required
      })).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail if bond sale is not active", async function () {
      // Deactivate bond sale
      await mevHarvestMultiplierNFT.deactivateBondSale();
      
      await expect(mevHarvestMultiplierNFT.connect(user1).purchaseHarvestBond({
        value: bondParams.bondPrice
      })).to.be.revertedWith("Bond sale is not active");
    });

    it("Should deactivate bond sale when all bonds are issued", async function () {
      // Purchase all bonds
      for (let i = 0; i < bondParams.totalBondsToIssue; i++) {
        await mevHarvestMultiplierNFT.connect(user1).purchaseHarvestBond({
          value: bondParams.bondPrice
        });
      }

      expect(await mevHarvestMultiplierNFT.bondSaleActive()).to.be.false;
    });
  });

  describe("MEV Profit Distribution", function () {
    const bondParams = {
      totalBondsToIssue: 4,
      bondPrice: ethers.parseEther("1"),
      maturityPeriod: 30 * 24 * 60 * 60, // 30 days
      profitSharePercentage: 25
    };

    beforeEach(async function () {
      await mevHarvestMultiplierNFT.createBondIssuance(bondParams);
      
      // Purchase all bonds
      for (let i = 0; i < bondParams.totalBondsToIssue; i++) {
        await mevHarvestMultiplierNFT.connect(user1).purchaseHarvestBond({
          value: bondParams.bondPrice
        });
      }
    });

    it("Should distribute MEV profits to bond holders", async function () {
      const totalProfit = ethers.parseEther("10"); // 10 ETH profit
      const expectedDistribution = totalProfit * BigInt(bondParams.profitSharePercentage) / BigInt(100); // 2.5 ETH
      const expectedPerBond = expectedDistribution / BigInt(bondParams.totalBondsToIssue); // 0.625 ETH per bond

      await expect(mevHarvestMultiplierNFT.connect(mockMEVHarvester).distributeMEVProfits(totalProfit))
        .to.emit(mevHarvestMultiplierNFT, "ProfitDistributed")
        .withArgs(totalProfit, expectedDistribution);

      // Check that each bond was updated
      for (let i = 1; i <= bondParams.totalBondsToIssue; i++) {
        const bondMetadata = await mevHarvestMultiplierNFT.getHarvestBond(i);
        expect(bondMetadata.totalProfitAccrued).to.equal(expectedPerBond);
        expect(bondMetadata.dailyProfitAccrued).to.equal(expectedPerBond);
      }
    });

    it("Should only allow MEV Harvester to distribute profits", async function () {
      await expect(mevHarvestMultiplierNFT.connect(user1).distributeMEVProfits(ethers.parseEther("10")))
        .to.be.revertedWith("Only MEV Harvester can distribute profits");
    });

    it("Should update visual state based on profit", async function () {
      // Distribute a small profit
      await mevHarvestMultiplierNFT.connect(mockMEVHarvester).distributeMEVProfits(ethers.parseEther("0.5"));
      
      const bondMetadata = await mevHarvestMultiplierNFT.getHarvestBond(1);
      expect(bondMetadata.visualState).to.equal("dim");
      
      // Distribute a larger profit
      await mevHarvestMultiplierNFT.connect(mockMEVHarvester).distributeMEVProfits(ethers.parseEther("5"));
      
      const bondMetadata2 = await mevHarvestMultiplierNFT.getHarvestBond(1);
      expect(bondMetadata2.visualState).to.equal("glowing");
    });
  });

  describe("Profit Claiming", function () {
    const bondParams = {
      totalBondsToIssue: 2,
      bondPrice: ethers.parseEther("1"),
      maturityPeriod: 30 * 24 * 60 * 60, // 30 days
      profitSharePercentage: 25
    };

    beforeEach(async function () {
      await mevHarvestMultiplierNFT.createBondIssuance(bondParams);
      
      // Purchase bonds
      await mevHarvestMultiplierNFT.connect(user1).purchaseHarvestBond({
        value: bondParams.bondPrice
      });
      
      await mevHarvestMultiplierNFT.connect(user2).purchaseHarvestBond({
        value: bondParams.bondPrice
      });
      
      // Distribute profits
      await mevHarvestMultiplierNFT.connect(mockMEVHarvester).distributeMEVProfits(ethers.parseEther("8"));
    });

    it("Should allow bond owners to claim profits", async function () {
      const user1Address = await user1.getAddress();
      const user1BalanceBefore = await ethers.provider.getBalance(user1Address);
      
      // User 1 claims profits
      const tx = await mevHarvestMultiplierNFT.connect(user1).claimProfits(1);
      const receipt = await tx.wait();
      
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const user1BalanceAfter = await ethers.provider.getBalance(user1Address);
      
      // User should receive 1 ETH (25% of 8 ETH / 2 bonds)
      expect(user1BalanceAfter - user1BalanceBefore + gasUsed).to.equal(ethers.parseEther("1"));
      
      // Check that claimed profits were updated
      const unclaimedProfits = await mevHarvestMultiplierNFT.getUnclaimedProfits(1);
      expect(unclaimedProfits).to.equal(0);
    });

    it("Should not allow non-owners to claim profits", async function () {
      await expect(mevHarvestMultiplierNFT.connect(user2).claimProfits(1))
        .to.be.revertedWith("Only bond owner can claim profits");
    });

    it("Should not allow claiming when no profits are available", async function () {
      // User 1 claims profits
      await mevHarvestMultiplierNFT.connect(user1).claimProfits(1);
      
      // Try to claim again
      await expect(mevHarvestMultiplierNFT.connect(user1).claimProfits(1))
        .to.be.revertedWith("No unclaimed profits");
    });
  });

  describe("Administrative Functions", function () {
    it("Should allow owner to set off-chain metadata URI", async function () {
      const bondParams = {
        totalBondsToIssue: 1,
        bondPrice: ethers.parseEther("1"),
        maturityPeriod: 30 * 24 * 60 * 60, // 30 days
        profitSharePercentage: 25
      };

      await mevHarvestMultiplierNFT.createBondIssuance(bondParams);
      await mevHarvestMultiplierNFT.connect(user1).purchaseHarvestBond({
        value: bondParams.bondPrice
      });

      const uri = "https://example.com/metadata/1";
      await mevHarvestMultiplierNFT.setOffchainMetadataURI(1, uri);

      const bondMetadata = await mevHarvestMultiplierNFT.getHarvestBond(1);
      expect(bondMetadata.offchainDataURI).to.equal(uri);
    });

    it("Should allow owner to reset daily profits", async function () {
      const bondParams = {
        totalBondsToIssue: 1,
        bondPrice: ethers.parseEther("1"),
        maturityPeriod: 30 * 24 * 60 * 60, // 30 days
        profitSharePercentage: 25
      };

      await mevHarvestMultiplierNFT.createBondIssuance(bondParams);
      await mevHarvestMultiplierNFT.connect(user1).purchaseHarvestBond({
        value: bondParams.bondPrice
      });

      // Distribute profits
      await mevHarvestMultiplierNFT.connect(mockMEVHarvester).distributeMEVProfits(ethers.parseEther("4"));

      const bondMetadataBefore = await mevHarvestMultiplierNFT.getHarvestBond(1);
      expect(bondMetadataBefore.dailyProfitAccrued).to.equal(ethers.parseEther("1"));

      // Reset daily profits
      await mevHarvestMultiplierNFT.resetDailyProfits();

      const bondMetadataAfter = await mevHarvestMultiplierNFT.getHarvestBond(1);
      expect(bondMetadataAfter.dailyProfitAccrued).to.equal(0);
    });

    it("Should allow owner to withdraw ETH", async function () {
      const deployerBalanceBefore = await ethers.provider.getBalance(await deployer.getAddress());
      
      // Send some ETH to the contract
      await deployer.sendTransaction({
        to: await mevHarvestMultiplierNFT.getAddress(),
        value: ethers.parseEther("1")
      });
      
      // Withdraw ETH
      const tx = await mevHarvestMultiplierNFT.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      
      const deployerBalanceAfter = await ethers.provider.getBalance(await deployer.getAddress());
      expect(deployerBalanceAfter - deployerBalanceBefore + gasUsed).to.equal(ethers.parseEther("1"));
    });
  });
});