/**
 * All tests are designed so they can be run indipentantly of eachother.
 * no test relies on the success of a pervious test in the same test block.
 *
 * A range of more tests could be written (some getters untested)
 * Only testing core functinallity due to time constraints
 */

// @ts-ignore
export {}; // Remove typescript blockscope error

const ResearchProject = artifacts.require("ResearchProject");

const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");

contract("ResearchProject", ([deployer, user1, user2, user3]) => {
  /**
   * Testing contract can be deployed and all default
   * state variables are set
   */
  it("Should initilize contract", async () => {
    // Deploy contract
    const researchProject = await ResearchProject.new(
      deployer,
      1,
      "Gene theropy",
      "Cancer Research",
      {
        from: deployer,
      }
    );

    // Confirm state variables are set
    const projectDetails = await researchProject.getProjectDetails();
    //@ts-ignore
    expect(projectDetails.id.toString()).to.equal("1");
    //@ts-ignore
    expect(projectDetails.cap.toString()).to.equal("0");
    //@ts-ignore
    expect(projectDetails.participntsCount.toString()).to.equal("0");
    //@ts-ignore
    expect(projectDetails.reward.toString()).to.equal("0");
    //@ts-ignore
    expect(projectDetails.status.toString()).to.equal("0");

    expect(projectDetails).to.deep.include({
      owner: deployer,
      title: "Gene theropy",
      entity: "Cancer Research",
    });
  });

  describe("Configuration stage", () => {
    /**
     * Confirm hard cap and reward size can be updated
     */
    it("Can update hard cap and reward size", async () => {
      const reward = new BN(10);

      //Deploy contract
      const researchProject = await ResearchProject.new(
        deployer,
        1,
        "Gene theropy",
        "Cancer Research",
        {
          from: deployer,
        }
      );

      // update hard cap and reward size
      const harCapRecipt = await researchProject.updateHardCap(20);
      const rewardRecipt = await researchProject.updateRewardAmount(reward);

      expectEvent(harCapRecipt, "LogHardCapUpdate", {
        value: "20",
      });

      expectEvent(rewardRecipt, "LogRewardUpdate", {
        value: "10",
      });

      // confirm change in state variables
      const rewardSize = await researchProject.rewardSize();
      const hardCap = await researchProject.hardCap();

      expect(rewardSize.toString()).to.eql(reward.toString());
      expect(hardCap.toString()).to.eql("20");
    });

    /**
     * test to confirm resarch project can be started
     * Also check that registration functions are no longer
     * callable
     */
    it("Can open registration and no longer access config functions", async () => {
      // Deploy
      const researchProject = await ResearchProject.new(
        deployer,
        1,
        "Gene theropy",
        "Cancer Research",
        {
          from: deployer,
        }
      );

      // Open research project after initial congig
      await researchProject.openResearchProjectRegistration({ from: deployer });

      await expectRevert(
        researchProject.updateHardCap(10),
        "Configurable: Project no longer in CONFIG stage"
      );

      await expectRevert(
        researchProject.updateRewardAmount(10),
        "Project no longer in CONFIG stage"
      );

      await expectRevert(
        researchProject.openResearchProjectRegistration({
          from: deployer,
        }),
        "Project no longer in CONFIG stage"
      );
    });
  });

  describe("Registration stage", () => {
    /**
     * confirm users can apply for reearch project
     */
    it("Can apply for project", async () => {
      // Deploy
      const researchProject = await ResearchProject.new(
        deployer,
        1,
        "Gene theropy",
        "Cancer Research",
        {
          from: deployer,
        }
      );

      await researchProject.openResearchProjectRegistration({ from: deployer });

      const recipt = await researchProject.applyForResearchProject({
        from: user1,
      });

      expectEvent(recipt, "LogApplyForResearchProject", {
        applicant: user1,
      });
    });

    /**
     * Ensure that particibants can be accepetd
     * or rejecte  by the contract owner
     */
    it("Owner can accept/reject participants", async () => {
      // Deploy
      const researchProject = await ResearchProject.new(
        deployer,
        1,
        "Gene theropy",
        "Cancer Research",
        {
          from: deployer,
        }
      );

      // Open registration
      await researchProject.openResearchProjectRegistration();

      // User applies for project
      await researchProject.applyForResearchProject({ from: user1 });
      await researchProject.applyForResearchProject({ from: user2 });
      const participants = await researchProject.getPendingParticipnts();

      expect(participants).to.be.an("array");
      expect(participants).to.have.length(2);
      expect(participants).to.deep.equal([user1, user2]);

      // Accept one user, reject other
      const [p1, p2] = participants;
      const acceptRecipt = await researchProject.acceptParticipnt(p1);
      const rejectRecipt = await researchProject.rejectParticipnt(p2);

      expectEvent(acceptRecipt, "LogAcceptedParticipnt", { applicant: p1 });
      expectEvent(rejectRecipt, "LogRejectedParticipnt", { applicant: p2 });

      // Check state variable is updated
      const participantsAgain = await researchProject.getPendingParticipnts();
      expect(participantsAgain).to.be.an("array").that.is.empty;

      const accpeted = await researchProject.getAcceptedParticipants();
      expect(accpeted).to.be.an("array");
      expect(accpeted).to.have.length(1);
      expect(accpeted).to.deep.equal([user1]);
    });

    /**
     * Confirm researh prject can be started
     * Confirm cannot be started with 0 participants
     * Confirm hard cap logic
     * confirm project cannot start unrill contract balance is >= reward distribution
     * Confirm reigstartion pahse functions can no longer be called
     */
    it("Can start research project", async () => {
      // Deploy
      const researchProject = await ResearchProject.new(
        deployer,
        1,
        "Gene theropy",
        "Cancer Research",
        {
          from: deployer,
        }
      );

      // configure
      await researchProject.updateRewardAmount(100);
      await researchProject.updateHardCap(1);
      await researchProject.openResearchProjectRegistration();

      // Attempt to start with no participants
      await expectRevert(
        researchProject.startResearchProject(),
        "There are currentlly no participnts"
      );

      // Add a participant
      await researchProject.applyForResearchProject({ from: user1 });
      await researchProject.acceptParticipnt(user1);

      // Attempt to apply when hard cap reached
      await expectRevert(
        researchProject.applyForResearchProject({ from: user2 }),
        "Maximum particapents reached"
      );

      // Confirm cannot start untill contract has correct founds.
      await expectRevert(
        researchProject.startResearchProject(),
        "Contract balance to low"
      );

      // Send ETH to contract
      // @ts-ignore
      await researchProject.sendTransaction({ from: deployer, value: 100 });

      // attempt to start proeject
      const recipt = await researchProject.startResearchProject();
      expectEvent(recipt, "LogProjectStarted", { projectId: "1" });

      // Confirm Registration functions can no longer be called
      expectRevert(
        researchProject.applyForResearchProject({ from: deployer }),
        "Configurable: Project no longer in REGESTRATION stage"
      );

      expectRevert(
        researchProject.startResearchProject({ from: deployer }),
        "Configurable: Project no longer in REGESTRATION stage"
      );

      expectRevert(
        researchProject.acceptParticipnt(deployer),
        "Configurable: Project no longer in REGESTRATION stage"
      );

      expectRevert(
        researchProject.rejectParticipnt(deployer),
        "Configurable: Project no longer in REGESTRATION stage"
      );
    });
  });

  describe("Project ended stage", () => {
    it("user can withdraw reward", async () => {
      // Deploy
      const researchProject = await ResearchProject.new(
        deployer,
        1,
        "Gene theropy",
        "Cancer Research",
        {
          from: deployer,
        }
      );

      // configure
      await researchProject.updateRewardAmount(100);
      await researchProject.updateHardCap(2);
      await researchProject.openResearchProjectRegistration();
      await researchProject.applyForResearchProject({ from: user1 });
      await researchProject.applyForResearchProject({ from: user2 });
      await researchProject.acceptParticipnt(user1);
      await researchProject.acceptParticipnt(user2);
      // @ts-ignore
      await researchProject.sendTransaction({ from: deployer, value: 200 });
      await researchProject.startResearchProject();

      // confirm obligation for one participant
      await researchProject.participntObligationMet(user1);

      // End research prject
      const recipt = await researchProject.endResearchProject();
      expectEvent(recipt, "LogProjectEnded", { ended: true });

      // useer who met obligation withdraw
      await researchProject.withdraw({ from: user1 });

      // user who did not meet obbligation withdraw
      await expectRevert(
        researchProject.withdraw({ from: user2 }),
        "Research obligation not met"
      );

      await expectRevert(
        researchProject.withdraw({ from: user3 }),
        "Research obligation not met"
      );

      await expectRevert(
        researchProject.participntObligationMet(user1),
        "Configurable: Project no longer in IN PROGRESS"
      );

      await expectRevert(
        researchProject.endResearchProject(),
        "Configurable: Project no longer in IN PROGRESS"
      );
    });
  });
});
