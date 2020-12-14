import Web3 from "web3";
import { abi } from "../../../build/contracts/ResearchProject.json";
import { networks } from "../../../build/contracts/ResearchMarketPlace.json";
import { ResearchProject } from "../../../types/web3-v1-contracts/ResearchProject";

const web3 = new Web3("ws://localhost:8545");

export default class ProjectContract {
  contract: ResearchProject;
  account: string;
  address: string;

  constructor(account: string, address: string) {
    this.contract = (new web3.eth.Contract(
      abi as any,
      address
    ) as any) as ResearchProject;

    this.account = account ? account : "";
    this.address = address;
  }

  //EVENTS
  LogHardcapUpdate(details: any, cb: Function) {
    return this.contract.events.LogHardCapUpdate(details, cb);
  }

  LogRewardUpdate(details: any, cb: Function) {
    return this.contract.events.LogRewardUpdate(details, cb);
  }

  LogProjectStart(details: any, cb: Function) {
    return this.contract.events.LogProjectStarted(details, cb);
  }

  LogProjectInRegistration(details: any, cb: Function) {
    return this.contract.events.LogProjectInRegistration(details, cb);
  }

  LogApplyForResearchProject(details: any, cb: Function) {
    return this.contract.events.LogApplyForResearchProject(details, cb);
  }

  LogAcceptedParticipnt(details: any, cb: Function) {
    return this.contract.events.LogAcceptedParticipnt(details, cb);
  }

  LogRejectedParticipnt(details: any, cb: Function) {
    return this.contract.events.LogRejectedParticipnt(details, cb);
  }

  LogProjectEnded(details: any, cb: Function) {
    return this.contract.events.LogProjectEnded(details, cb);
  }

  // SEND ETHER TO CONTRACT
  public async sendEthToContract(wei: string) {
    let send = web3.eth.sendTransaction({
      from: this.account,
      to: this.address,
      value: wei,
    });
  }

  // SETTERS
  public async setHardCap(value: string) {
    return await this.contract.methods
      .updateHardCap(value)
      .send({ from: this.account });
  }

  public async setReward(value: string) {
    return await this.contract.methods
      .updateRewardAmount(value)
      .send({ from: this.account });
  }

  public async openReasurchProject() {
    return this.contract.methods
      .openResearchProjectRegistration()
      .send({ from: this.account });
  }

  public async startResearchProject() {
    return this.contract.methods
      .startResearchProject()
      .send({ from: this.account });
  }

  public async applyForProject() {
    return this.contract.methods
      .applyForResearchProject()
      .send({ from: this.account });
  }

  public async acceptParticipant(address: string) {
    return this.contract.methods
      .acceptParticipnt(address)
      .send({ from: this.account, gas: 1000000 });
  }

  public async rejectParticipant(address: string) {
    return this.contract.methods
      .rejectParticipnt(address)
      .send({ from: this.account });
  }

  public async endProject() {
    return this.contract.methods
      .endResearchProject()
      .send({ from: this.account });
  }

  public async researchObligationMet(address: string) {
    return this.contract.methods
      .participntObligationMet(address)
      .send({ from: this.account });
  }

  public withdrawReward() {
    console.log("WATHDRAWING FROM CONTRACT");
    return this.contract.methods.withdraw().send({
      from: this.account,
    });
  }

  // GETTERS
  public async getParticipantByAddress(address: string) {
    return await this.contract.methods.getParticipant(address).call();
  }

  public async getPendingParticipants() {
    return await this.contract.methods.getPendingParticipnts().call();
  }

  public async getAcceptedParticipannts() {
    return await this.contract.methods.getAcceptedParticipants().call();
  }

  public async getProjectStatus() {
    // @ts-ignore
    return await this.contract.methods.projectStatus.call().call();
  }

  public async getContractBalance() {
    // @ts-ignore
    return await this.contract.methods.getContractBalance().call();
  }

  public async getParticipntCount() {
    // @ts-ignore
    return await this.contract.methods.participntCount().call();
  }

  public async getRewardSize() {
    // @ts-ignore
    return await this.contract.methods.rewardSize().call();
  }

  public async getProjectOwner() {
    return await this.contract.methods.owner().call();
  }

  public async getHardCap() {
    return await this.contract.methods.hardCap().call();
  }

  public async getProjectId() {
    //@ts-ignore
    return await this.contract.methods.projectOwner().call();
  }

  public async getEntityName() {
    //@ts-ignore
    return await this.contract.methods.entityName().call();
  }
}
