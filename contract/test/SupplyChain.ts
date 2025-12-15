import { expect } from "chai";
import hre from "hardhat";

describe("SupplyChain", function () {
  let supplyChain: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    // Deploy contract
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChain.deploy();
    await supplyChain.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await supplyChain.getAddress()).to.be.properAddress;
    });

    it("Should have zero products initially", async function () {
      expect(await supplyChain.getProductCount()).to.equal(0);
    });
  });

  describe("Product Creation", function () {
    it("Should create a product successfully", async function () {
      const tx = await supplyChain.createProduct("Test Product", "Test Description");
      await tx.wait();

      const productCount = await supplyChain.getProductCount();
      expect(productCount).to.equal(1);

      const product = await supplyChain.getProduct(1);
      expect(product.name).to.equal("Test Product");
      expect(product.description).to.equal("Test Description");
      expect(product.manufacturer).to.equal(owner.address);
      expect(product.currentOwner).to.equal(owner.address);
    });

    it("Should emit ProductCreated event", async function () {
      await expect(supplyChain.createProduct("Test Product", "Test Description"))
        .to.emit(supplyChain, "ProductCreated")
        .withArgs(1, "Test Product", owner.address);
    });

    it("Should create multiple products", async function () {
      await supplyChain.createProduct("Product 1", "Description 1");
      await supplyChain.createProduct("Product 2", "Description 2");
      await supplyChain.createProduct("Product 3", "Description 3");

      expect(await supplyChain.getProductCount()).to.equal(3);
    });
  });

  describe("Product Transfer", function () {
    beforeEach(async function () {
      await supplyChain.createProduct("Test Product", "Test Description");
    });

    it("Should transfer product ownership", async function () {
      await supplyChain.transferProduct(1, addr1.address);

      const product = await supplyChain.getProduct(1);
      expect(product.currentOwner).to.equal(addr1.address);
    });

    it("Should emit ProductTransferred event", async function () {
      await expect(supplyChain.transferProduct(1, addr1.address))
        .to.emit(supplyChain, "ProductTransferred")
        .withArgs(1, owner.address, addr1.address);
    });

    it("Should fail if not the owner tries to transfer", async function () {
      await expect(
        supplyChain.connect(addr1).transferProduct(1, addr2.address)
      ).to.be.revertedWith("Not the owner of this product");
    });

    it("Should fail if transferring to zero address", async function () {
      await expect(
        supplyChain.transferProduct(1, "0x0000000000000000000000000000000000000000")
      ).to.be.revertedWith("Cannot transfer to zero address");
    });

    it("Should fail if transferring to yourself", async function () {
      await expect(
        supplyChain.transferProduct(1, owner.address)
      ).to.be.revertedWith("Cannot transfer to yourself");
    });
  });

  describe("Product Update", function () {
    beforeEach(async function () {
      await supplyChain.createProduct("Test Product", "Test Description");
    });

    it("Should update product information", async function () {
      await supplyChain.updateProduct(1, "Updated Product", "Updated Description");

      const product = await supplyChain.getProduct(1);
      expect(product.name).to.equal("Updated Product");
      expect(product.description).to.equal("Updated Description");
    });

    it("Should emit ProductUpdated event", async function () {
      await expect(supplyChain.updateProduct(1, "Updated Product", "Updated Description"))
        .to.emit(supplyChain, "ProductUpdated")
        .withArgs(1, "Updated Product", "Updated Description");
    });

    it("Should fail if not the owner tries to update", async function () {
      await expect(
        supplyChain.connect(addr1).updateProduct(1, "Updated", "Updated")
      ).to.be.revertedWith("Not the owner of this product");
    });
  });

  describe("Product Retrieval", function () {
    beforeEach(async function () {
      await supplyChain.createProduct("Product 1", "Description 1");
      await supplyChain.createProduct("Product 2", "Description 2");
    });

    it("Should get product by ID", async function () {
      const product = await supplyChain.getProduct(1);
      expect(product.id).to.equal(1);
      expect(product.name).to.equal("Product 1");
    });

    it("Should get all product IDs", async function () {
      const productIds = await supplyChain.getAllProductIds();
      expect(productIds.length).to.equal(2);
      expect(productIds[0]).to.equal(1);
      expect(productIds[1]).to.equal(2);
    });

    it("Should fail if product doesn't exist", async function () {
      await expect(supplyChain.getProduct(999)).to.be.revertedWith("Product does not exist");
    });
  });
});

