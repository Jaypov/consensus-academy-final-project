/**
 * All tests are designed so they can be run indipentantly of eachother.
 * no test relies on the success of a pervious test in the same test block.
 *
 * A range of more tests could be written (some getters untested)
 * Only testing core functinallity due to time constraints
 */
// @ts-ignore
export {}; // Remove typescript blockscope error
const ResearchMarketPlace = artifacts.require("ResearchMarketPlace");

const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");

contract("ResearchMarketPlace", ([deployer, user1]) => {
  /**
   * Test initilizing contract
   * shoul set owner
   * should set fee
   */
  it("should initilize contract", async () => {
    const feePrice = new BN(2);

    const marketplace = await ResearchMarketPlace.new(feePrice, {
      from: deployer,
    });

    const fee = await marketplace.getFeePrice();
    const owner = await marketplace.owner();

    expect(feePrice.toString()).to.be.equal(fee.toString());
    expect(owner).to.be.equal(deployer);
  });

  /**
   * Check fee price can be updated
   * and event is emmited
   */
  it("Can update fee price", async () => {
    const feePrice = new BN(2);
    const newFeePrice = new BN(4);

    // init contract
    const marketplace = await ResearchMarketPlace.new(feePrice, {
      from: deployer,
    });

    // expect only owner able to execute
    await expectRevert(
      marketplace.updateFeePrice(newFeePrice, { from: user1 }),
      "Ownable: caller is not the owner"
    );

    // update fee as owner and check results
    const recipt = await marketplace.updateFeePrice(newFeePrice, {
      from: deployer,
    });

    const fee = await marketplace.getFeePrice();

    expect(newFeePrice.toString()).to.be.equal(fee.toString());

    expectEvent(recipt, "LogFeeUpdated", {
      applicationFee: newFeePrice.toString(),
    });
  });

  /**
   * Ensure only the owner of the contract
   * can pause the contract
   */
  it("Only owner can pause", async () => {
    const feePrice = new BN(2);

    // Deploy contract instance
    const marketplace = await ResearchMarketPlace.new(feePrice, {
      from: deployer,
    });

    // attempt to call pause function as NOT owner
    await expectRevert(
      marketplace.pause({
        from: user1,
      }),
      "Ownable: caller is not the owner"
    );
  });

  describe("Can create research project", () => {
    const feePrice = new BN(2);

    /**
     * Ensure that requestResearchProject is pausable.
     * stops users depositing ETH in case of bug or hack
     */
    it("Is pausable", async () => {
      // Deploy instance
      const marketplace = await ResearchMarketPlace.new(feePrice, {
        from: deployer,
      });

      // Pause contract as OWNER
      await marketplace.pause({
        from: deployer,
      });

      // Confirm pause variable is set to true
      const paused = await marketplace.paused();
      expect(paused).to.equal(true);

      // Call requestResearchPrjoect function when contract is paused
      await expectRevert(
        marketplace.requestResearchPrjoect("", "", "", "", {
          from: deployer,
          value: "1",
        }),
        "Pausable: paused"
      );
    });

    /**
     * ensure user cannot create a project
     * paying less than the required fee
     */
    it("Ensure fee must be met", async () => {
      // Deploy instance
      const marketplace = await ResearchMarketPlace.new(feePrice, {
        from: deployer,
      });

      // request requestResearchPrjoect function with eth value < fee value
      await expectRevert(
        marketplace.requestResearchPrjoect("", "", "", "", {
          from: deployer,
          value: "1",
        }),
        "ResearchMarketPlace: Fee requirement not met"
      );
    });

    /**
     * Ensure a project request can be made
     * Ensure an event is emitted
     * Ensure project is in Enumarable set of requested projects
     * Ensure project can be retrewived by ID
     */
    it("Can create research project request", async () => {
      // Deploy instance
      const marketplace = await ResearchMarketPlace.new(feePrice, {
        from: deployer,
      });

      // Call function with correct params and value
      const recipt = await marketplace.requestResearchPrjoect(
        "Gene therapy research",
        "theteam@cancerresearch.blah",
        "Cancer Research",
        "+4400000000000",
        {
          from: user1,
          value: feePrice,
        }
      );

      expectEvent(recipt, "LogResearchProjectRequest", {
        applicant: user1,
        projectId: "1",
      });

      // confirm project is added as a pending prject
      const pendingProjects = await marketplace.getPendingResearchProjects();

      expect(pendingProjects).to.be.an("array");
      expect(pendingProjects).to.have.lengthOf(1);
      expect(pendingProjects[0].toString()).to.equal("1");

      const project = await marketplace.getResearchProjectById(
        pendingProjects[0]
      );

      //@ts-ignore
      expect(project.owner).to.eql(user1);
      //@ts-ignore
      expect(project.projectName).to.eql("Gene therapy research");
      //@ts-ignore
      expect(project.email).to.eql("theteam@cancerresearch.blah");
      //@ts-ignore
      expect(project.phone).to.eql("+4400000000000");
      //@ts-ignore
      expect(project.projectId.toString()).to.eql("1");
      //@ts-ignore
      expect(project.projectContract).to.eql(constants.ZERO_ADDRESS);
      //@ts-ignore
      expect(project.status.toString()).to.eql("0");
    });
  });

  describe("Admin can accept/reject projects", () => {
    const feePrice = new BN(2);

    /**
     * Ensure a project can be accpeted
     * and all state veriables are updated corectlly
     */
    it("Can accept research project", async () => {
      // Deploy instance
      const marketplace = await ResearchMarketPlace.new(feePrice, {
        from: deployer,
      });

      // Call function with correct params and value
      await marketplace.requestResearchPrjoect(
        "Gene therapy research",
        "theteam@cancerresearch.blah",
        "Cancer Research",
        "+4400000000000",
        {
          from: user1,
          value: feePrice,
        }
      );

      // Accept project as admin
      const recipt = await marketplace.acceptResearchProject(new BN(1), {
        from: deployer,
      });

      expectEvent(recipt, "LogResearchProjectAccepted", {
        applicant: user1,
        id: "1",
      });

      // Check pending project is now accepted
      const proejcts = await marketplace.getAcceptedresearchProjects();

      expect(proejcts).to.be.an("array");
      expect(proejcts).to.have.length(1);

      const project = await marketplace.getResearchProjectById("1");

      //@ts-ignore
      expect(project.owner).to.eql(user1);
      //@ts-ignore
      expect(project.projectName).to.eql("Gene therapy research");
      //@ts-ignore
      expect(project.email).to.eql("theteam@cancerresearch.blah");
      //@ts-ignore
      expect(project.phone).to.eql("+4400000000000");
      //@ts-ignore
      expect(project.projectId.toString()).to.eql("1");
      //@ts-ignore
      expect(project.projectContract).not.equal(constants.ZERO_ADDRESS);
      //@ts-ignore
      expect(project.status.toString()).to.eql("1");

      // Check proejct is removed from pending
      const pendingProjects = await marketplace.getPendingResearchProjects();
      expect(pendingProjects).to.be.an("array");
      expect(pendingProjects).to.have.length(0);
    });

    /**
     * Ensure a project can be rejected
     * and all state variables are updated corectlly
     */
    it("Can reject research project", async () => {
      // Deploy instance
      const marketplace = await ResearchMarketPlace.new(feePrice, {
        from: deployer,
      });

      // Call function with correct params and value
      await marketplace.requestResearchPrjoect(
        "Gene therapy research",
        "theteam@cancerresearch.blah",
        "Cancer Research",
        "+4400000000000",
        {
          from: user1,
          value: feePrice,
        }
      );

      // Accept project as admin
      const recipt = await marketplace.rejectResearchProject(new BN(1), {
        from: deployer,
      });

      expectEvent(recipt, "LogResearchProjectRejected", {
        applicant: user1,
        id: "1",
      });

      // Check proejct is removed from pending
      const pendingProjects = await marketplace.getPendingResearchProjects();
      expect(pendingProjects).to.be.an("array");
      expect(pendingProjects).to.have.length(0);
    });
  });
});
