import Web3 from "web3";
import {
  abi,
  networks,
} from "../../../build/contracts/ResearchMarketPlace.json";
import { ResearchMarketPlace } from "../../../types/web3-v1-contracts/ResearchMarketPlace";

const web3 = new Web3("ws://localhost:8545");

export default class MarketplaceContract {
  contract: ResearchMarketPlace;
  account: string;

  constructor(account: string) {
    //@ts-ignore
    this.contract = (new web3.eth.Contract(
      abi as any,
      //@ts-ignore
      networks[1337].address as any
    ) as any) as ResearchMarketPlace;

    this.account = account || "";
  }

  async getFeePrice() {
    return this.contract.methods.getFeePrice().call();
  }

  async getContractOwner() {
    return this.contract.methods.owner().call();
  }

  async getContractBalance() {
    return this.contract.methods.getMarketPlaceBalance().call();
  }

  async getPendingProjects() {
    const Ids = await this.getPendingProjectIds();
    return Promise.all(
      Ids.map((id) => this.contract.methods.getResearchProjectById(id).call())
    );
  }

  async getAcceptedProjects() {
    const Ids = await this.getAcceptedProjectsIds();
    return Promise.all(
      Ids.map((id) => this.contract.methods.getResearchProjectById(id).call())
    );
  }

  async updateFee(amount: string) {
    return await this.contract.methods
      .updateFeePrice(amount)
      .send({ from: this.account });
  }

  async withdrawBalance(amount: string) {
    return await this.contract.methods
      .withdraw(amount)
      .send({ from: this.account });
  }

  async changeOwner(addresss: string) {
    return await this.contract.methods
      .transferOwnership(addresss)
      .send({ from: this.account });
  }

  async creatProject(
    projectName: string,
    email: string,
    entityName: string,
    phone: string,
    marketplaceFee: string
  ) {
    const gasAmount = await this.contract.methods
      .requestResearchPrjoect(projectName, email, entityName, phone)
      .estimateGas({ from: this.account, value: marketplaceFee })
      .catch((error) => console.log({ error }));

    if (gasAmount) {
      return this.contract.methods
        .requestResearchPrjoect(projectName, email, entityName, phone)
        .send({
          from: this.account,
          value: marketplaceFee,
          gas: gasAmount,
        })
        .catch(console.log);
    }
  }

  async acceptProject(id: string) {
    return await this.contract.methods
      .acceptResearchProject(id)
      .send({
        from: this.account,
        gas: await this.contract.methods
          .acceptResearchProject(id)
          .estimateGas(),
      })
      .catch(console.log);
  }

  async rejectProject(id: string) {
    return await this.contract.methods
      .rejectResearchProject(id)
      .send({
        from: this.account,
        gas: await this.contract.methods
          .rejectResearchProject(id)
          .estimateGas(),
      })
      .catch(console.log);
  }

  LogFee(details: any, cb: Function) {
    return this.contract.events.LogFeeUpdated(details, cb);
  }

  LogResearchProjectRequest(details: any, cb: Function) {
    return this.contract.events.LogResearchProjectRequest(details, cb);
  }

  LogResearchProjectAccepted(details: any, cb: Function) {
    return this.contract.events.LogResearchProjectAccepted(details, cb);
  }

  LogResearchProjectRejected(details: any, cb: Function) {
    return this.contract.events.LogResearchProjectRejected(details, cb);
  }

  private async getPendingProjectIds() {
    return this.contract.methods.getPendingResearchProjects().call();
  }

  private async getAcceptedProjectsIds() {
    return this.contract.methods.getAcceptedresearchProjects().call();
  }
}
