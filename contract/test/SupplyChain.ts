import { expect } from "chai";
import hre from "hardhat";

describe("SupplyChain", function () {
  let supplyChain: any;
  let admin: any;
  let manufacturer: any;
  let transporter: any;
  let retailer: any;
  let auditor: any;
  let other: any;

  beforeEach(async function () {
    [admin, manufacturer, transporter, retailer, auditor, other] = await hre.ethers.getSigners();

    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChain.deploy();
    await supplyChain.waitForDeployment();

    // Grant roles to specific accounts (constructor already grants to deployer)
    await supplyChain.grantRoleTo(await supplyChain.MANUFACTURER_ROLE(), manufacturer.address);
    await supplyChain.grantRoleTo(await supplyChain.TRANSPORTER_ROLE(), transporter.address);
    await supplyChain.grantRoleTo(await supplyChain.RETAILER_ROLE(), retailer.address);
    await supplyChain.grantRoleTo(await supplyChain.AUDITOR_ROLE(), auditor.address);
  });

  describe("Roles", function () {
    it("Admin can grant and revoke roles", async function () {
      const role = await supplyChain.MANUFACTURER_ROLE();
      await supplyChain.grantRoleTo(role, other.address);
      expect(await supplyChain.hasRole(role, other.address)).to.equal(true);

      await supplyChain.revokeRoleFrom(role, other.address);
      expect(await supplyChain.hasRole(role, other.address)).to.equal(false);
    });
  });

  describe("Shipments & Proofs", function () {
    it("Manufacturer can create shipment", async function () {
      await supplyChain.connect(manufacturer).createShipment(1, "temp:2-8C");
      const shipment = await supplyChain.getShipment(1);
      expect(shipment.id).to.equal(1);
      expect(shipment.manufacturer).to.equal(manufacturer.address);
      expect(shipment.metadata).to.equal("temp:2-8C");
      // status enum Created = 0
      expect(shipment.status).to.equal(0);
    });

    it("Transporter can record proof and move status to InTransit", async function () {
      await supplyChain.connect(manufacturer).createShipment(2, "metadata");
      const hash = hre.ethers.id("proof-json");
      await expect(supplyChain.connect(transporter).recordProof(2, hash))
        .to.emit(supplyChain, "ProofRecorded")
        .withArgs(2, hash, transporter.address);

      const proofs = await supplyChain.getProofs(2);
      expect(proofs.length).to.equal(1);
      expect(proofs[0].hash).to.equal(hash);

      const shipment = await supplyChain.getShipment(2);
      // InTransit = 1
      expect(shipment.status).to.equal(1);
    });

    it("Retailer can confirm delivery", async function () {
      await supplyChain.connect(manufacturer).createShipment(3, "metadata");
      await supplyChain.connect(transporter).recordProof(3, hre.ethers.id("p"));
      await expect(supplyChain.connect(retailer).confirmDelivery(3))
        .to.emit(supplyChain, "DeliveryConfirmed")
        .withArgs(3, retailer.address);

      const shipment = await supplyChain.getShipment(3);
      // Delivered = 2
      expect(shipment.status).to.equal(2);
    });

    it("Non-role accounts cannot call restricted functions", async function () {
      await expect(
        supplyChain.connect(other).createShipment(4, "x")
      ).to.be.revertedWithCustomError(supplyChain, "AccessControlUnauthorizedAccount");

      await supplyChain.connect(manufacturer).createShipment(4, "x");
      await expect(
        supplyChain.connect(other).recordProof(4, hre.ethers.id("p"))
      ).to.be.revertedWithCustomError(supplyChain, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Products (backward compatibility)", function () {
    it("Should create and retrieve product", async function () {
      await supplyChain.createProduct("Test Product", "Desc");
      const product = await supplyChain.getProduct(1);
      expect(product.name).to.equal("Test Product");
      expect(product.manufacturer).to.equal(admin.address);
    });

    it("Should transfer and update product", async function () {
      await supplyChain.createProduct("A", "B");
      await supplyChain.transferProduct(1, manufacturer.address);
      const afterTransfer = await supplyChain.getProduct(1);
      expect(afterTransfer.currentOwner).to.equal(manufacturer.address);

      await supplyChain.connect(manufacturer).updateProduct(1, "A2", "B2");
      const afterUpdate = await supplyChain.getProduct(1);
      expect(afterUpdate.name).to.equal("A2");
    });
  });
});

