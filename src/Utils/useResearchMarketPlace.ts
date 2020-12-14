import { useEffect, useState } from "react";
import MarketplaceContract from "./contracts/MarketplaceContract";
import { useWeb3React } from "@web3-react/core";

export function useMarketplaceContract() {
  const [contract, setContract] = useState<MarketplaceContract>();
  const [contractOwner, setContractOwner] = useState("");
  const [fee, setFee] = useState("");
  const [balance, setBalance] = useState("");
  const [pendingProjects, setPendingProjects] = useState([]);
  const [acceptedProjects, setAcceptedProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);

  const { library, account } = useWeb3React();

  useEffect(() => {
    (async () => {
      if (library && account) {
        const contract = new MarketplaceContract(account);

        //@ts-ignore
        const [
          mpFee,
          mpOwner,
          mpBalance,
          mpAccepteProj,
          mpPendingProj,
        ] = await Promise.all([
          contract.getFeePrice(),
          contract.getContractOwner(),
          contract.getContractBalance(),
          contract.getAcceptedProjects(),
          contract.getPendingProjects(),
        ]).catch((e) => {
          console.log(e);
        });

        setContract(contract);
        setFee(mpFee as string);
        setContractOwner(mpOwner as string);
        setBalance(mpBalance as string);
        setAcceptedProjects(mpAccepteProj as []);
        setPendingProjects(mpPendingProj as []);

        contract.LogFee({ fromBlock: 0 }, (error: any, event: any) => {
          if (!error) setFee(event.returnValues.applicationFee);
        });

        contract.LogResearchProjectRequest(
          { fromBlock: 0 },
          async (error: any, event: any) => {
            if (!error) {
              const p = await contract.getPendingProjects();
              setPendingProjects(p as []);
            }
          }
        );

        contract.LogResearchProjectAccepted(
          { fromBlock: 0 },
          async (error: any, event: any) => {
            if (!error) {
              const p = await contract.getPendingProjects();
              const a = await contract.getAcceptedProjects();
              setPendingProjects(p as []);
              setAcceptedProjects(a as []);
            }
          }
        );

        contract.LogResearchProjectRejected(
          { fromBlock: 0 },
          async (error: any, event: any) => {
            if (!error) {
              const p = await contract.getPendingProjects();
              setPendingProjects(p as []);
            }
          }
        );
      }
    })();
  }, [library, account]);

  async function updateFee(amount: string) {
    //@ts-ignore
    return contract.updateFee(amount).catch((e) => {
      const { message } = e;
      throw new Error(extractError(message));
    });
  }

  async function withdrawBalance(amount: string) {
    //@ts-ignore
    return contract.withdrawBalance(amount).catch(console.log);
  }

  async function changeOwner(address: string) {
    //@ts-ignore
    return contract.changeOwner(address).catch(console.log);
  }

  async function createProject(
    projectName: string,
    email: string,
    entityName: string,
    phone: string
  ) {
    //@ts-ignore
    return contract
      .creatProject(projectName, email, entityName, phone, fee)
      .catch((e) => {
        const { message } = e;
        throw new Error(extractError(message));
      });
  }

  async function acceptProject(id: string) {
    //@ts-ignore
    return contract.acceptProject(id);
  }

  async function rejectProject(id: string) {
    //@ts-ignore
    return contract.rejectProject(id);
  }

  function onFeeUpdateEvent() {
    return contract?.LogFee;
  }

  function extractError(message: string): string {
    const splitWord = "revert";
    return message.slice(message.indexOf(splitWord) + splitWord.length);
  }

  return {
    contractInstance: contract,
    fee,
    contractOwner,
    balance,
    acceptedProjects,
    pendingProjects,
    myProjects,
    onFeeUpdateEvent,
    updateFee,
    withdrawBalance,
    changeOwner,
    createProject,
    acceptProject,
    rejectProject,
  };
}
