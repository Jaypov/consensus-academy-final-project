import { useEffect, useState } from "react";
import ProjectContract from "./contracts/ProjectContract";
import { useWeb3React } from "@web3-react/core";

export function useProjectContract(address: string) {
  const [contract, setConntract] = useState<ProjectContract>();
  const [status, setStatus] = useState("");
  const [balance, setBalance] = useState("");
  const [participantCount, setParticipantCount] = useState("");
  const [reward, setReward] = useState("");
  const [owner, setOwner] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [entityName, setEntityName] = useState("");
  const [hardCap, setHardCap] = useState("");
  const [pendingParticipants, setPendingParticipants] = useState([]);
  const [acceptedParticipants, setAcceptedParticipants] = useState([]);
  const [acceptedParticipantList, setAcceptedParticipantList] = useState({});

  const { library, account } = useWeb3React();

  useEffect(() => {
    (async () => {
      if (library && account && address) {
        if (
          address &&
          address !== "0x0000000000000000000000000000000000000000"
        ) {
          const statuses = ["CONFIG", "REGESTRATION", "IN PROGRESS", "ENDED"];
          const contract = new ProjectContract(account, address);

          //@ts-ignore
          const [
            pOwner,
            pProjectId,
            pEntityName,
            pStatus,
            pBalance,
            pCount,
            pReward,
            pHardCap,
            pPendingParticipants,
            pAccepteParticipants,
          ] = await Promise.all([
            contract.getProjectOwner(),
            contract.getProjectId(),
            contract.getEntityName(),
            contract.getProjectStatus(),
            contract.getContractBalance(),
            contract.getParticipntCount(),
            contract.getRewardSize(),
            contract.getHardCap(),
            contract.getPendingParticipants(),
            contract.getAcceptedParticipannts(),
          ]).catch((e) => {
            console.log("ERROZ", e);
          });

          setConntract(contract);
          setOwner(pOwner as string);
          setProjectId(pProjectId as string);
          setEntityName(pEntityName as string);
          setStatus(statuses[pStatus as any]);
          setBalance(pBalance as string);
          setParticipantCount(pCount as string);
          setReward(pReward as string);
          setHardCap(pHardCap as string);
          setPendingParticipants(pPendingParticipants as []);
          setAcceptedParticipants(pAccepteParticipants as []);

          if (pAccepteParticipants && contract) {
            const participants = pAccepteParticipants.map(async (p) => {
              const participant = await contract.getParticipantByAddress(p);
              return { [p]: participant.completed };
            });

            const all = await Promise.all(participants);
            setAcceptedParticipantList(Object.assign({}, ...all));
          }

          contract.LogRewardUpdate(
            { fromBlock: 0 },
            (error: any, event: any) => {
              console.log("REWARD", event.returnValues);
              if (!error) setReward(event.returnValues.value);
            }
          );

          contract.LogHardcapUpdate(
            { fromBlock: 0 },
            (error: any, event: any) => {
              if (!error) setHardCap(event.returnValues.value);
            }
          );

          contract.LogApplyForResearchProject(
            { fromBlock: 0 },
            (error: any, event: any) => {
              if (!error) setStatus(statuses[1]);
              console.log("APPLY FOR RESEARCH PROJECT EVENT");
            }
          );

          contract.LogAcceptedParticipnt(
            { fromBlock: 0 },
            (error: any, event: any) => {
              if (!error) {
                contract
                  .getAcceptedParticipannts()
                  .then((d) => setAcceptedParticipants(d as []));

                contract
                  .getPendingParticipants()
                  .then((d) => setPendingParticipants(d as []));
              }
            }
          );

          contract.LogRejectedParticipnt(
            { fromBlock: 0 },
            (error: any, event: any) => {
              if (!error) {
                contract
                  .getPendingParticipants()
                  .then((d) => setPendingParticipants(d as []));
              }
            }
          );

          // STAGE SWITCH EVENTS
          contract.LogProjectStart(
            { fromBlock: 0, toBlock: "latest" },
            (error: any, event: any) => {
              if (!error) {
                contract.getProjectStatus().then((currentStatus) => {
                  console.log("2", ">=", currentStatus, "2" >= currentStatus);
                  console.log(statuses[2]);
                  setStatus("2" >= currentStatus ? statuses[2] : currentStatus);
                });
              }
            }
          );

          contract.LogProjectEnded(
            { fromBlock: 0, toBlock: "latest" },
            (error: any, event: any) => {
              if (!error) {
                contract.getProjectStatus().then((currentStatus) => {
                  console.log({ currentStatus });
                  setStatus(statuses[3]);
                });
              }
            }
          );

          contract.LogProjectInRegistration(
            { fromBlock: 0, toBlock: "latest" },
            (error: any, event: any) => {
              if (!error) {
                console.log("Logging regestration complete");
                contract.getProjectStatus().then((currentStatus) => {
                  console.log({ currentStatus });
                  setStatus(
                    "1" >= currentStatus
                      ? statuses[1]
                      : statuses[parseInt(currentStatus)]
                  );
                });
              }
            }
          );
        }
      }
    })();
  }, [account, library, address]);

  async function updateHardCap(value: string) {
    await contract?.setHardCap(value).catch((e) => console.log(e));
  }

  async function updateReward(value: string) {
    await contract?.setReward(value).catch((e) => console.log(e));
  }

  async function openProject() {
    await contract?.openReasurchProject().catch((e) => console.log(e));
  }

  async function applyForProject() {
    await contract?.applyForProject().catch((e) => console.log(e));
  }

  async function startProject() {
    await contract?.startResearchProject().catch((e) => {
      const { message } = e;
      throw new Error(extractError(message));
    });
  }

  async function acceptParticipant(address: string) {
    console.log("ACCEPTING");
    await contract?.acceptParticipant(address).catch((e) => console.log(e));
  }

  async function rejectParticipant(address: string) {
    await contract?.rejectParticipant(address).catch((e) => console.log(e));
  }

  async function endProject() {
    return await contract?.endProject().catch((e) => {
      console.log(e);
    });
  }

  async function obligationMet(address: string) {
    await contract?.researchObligationMet(address).catch((e) => console.log(e));
  }

  async function withdrawFounds() {
    await contract?.withdrawReward().catch((e) => console.log(e));
  }

  function extractError(message: string): string {
    const splitWord = "revert";
    return message.slice(message.indexOf(splitWord) + splitWord.length);
  }

  function sendEthToContract(wei: string) {
    return contract
      ?.sendEthToContract(wei)
      .then(async () => {
        const bal = await contract.getContractBalance();
        console.log("UPDATING BALANCE", bal);
        setBalance(bal);
      })
      .catch((e) => console.log(e));
  }

  return {
    owner,
    projectId,
    projectName,
    entityName,
    status,
    reward,
    hardCap,
    pendingParticipants,
    acceptedParticipants,
    balance,
    acceptedParticipantList,
    withdrawFounds,
    updateHardCap,
    updateReward,
    openProject,
    applyForProject,
    startProject,
    acceptParticipant,
    rejectParticipant,
    sendEthToContract,
    endProject,
    obligationMet,
  };
}
