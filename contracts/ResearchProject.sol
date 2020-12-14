// "SPDX-License-Identifier: UNLICENSED"
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./Configurable.sol";

/// @title cintract created by factory ResearchMarketPlace
/// @author Jay Povey
contract ResearchProject is Ownable, Pausable, Configurable {
    using EnumerableSet for EnumerableSet.AddressSet;

    address public projectOwner;
    uint256 public prjectId;
    string public projectName;
    string public entityName;
    uint256 public hardCap = 0;
    uint256 public participntCount = 0;
    uint256 public rewardSize = 0;

    struct Participant {
        bool accepted;
        bool completed;
        uint256 reward;
    }

    mapping(address => Participant) private participants;
    EnumerableSet.AddressSet private pendingApplicants;
    EnumerableSet.AddressSet private acceptedParticipants;

    event LogApplyForResearchProject(address applicant);
    event LogAcceptedParticipnt(address applicant);
    event LogRejectedParticipnt(address applicant);
    event LogHardCapUpdate(uint256 value);
    event LogRewardUpdate(uint256 value);
    event LogProjectInRegistration(uint256 projectId);
    event LogProjectStarted(uint256 projectId);
    event LogProjectEnded(bool ended);

    /// @notice reverts if hard cap set in contract is >=
    modifier capNotReached() {
        if (hardCap > 0 && participntCount >= hardCap) {
            revert("Maximum particapents reached");
        }
        _;
    }

    /// @notice sets parameters passed in from factory contract, sets passed address as owner
    /// @param _projectOwner address of the sender account that requested the project
    /// @param _prjectId Id of the project
    /// @param _projectName descriptive name of the research project
    /// @param _entityName name of the entity of the research project
    constructor(
        address _projectOwner,
        uint256 _prjectId,
        string memory _projectName,
        string memory _entityName
    ) public {
        projectOwner = _projectOwner;
        prjectId = _prjectId;
        projectName = _projectName;
        entityName = _entityName;
        Ownable.transferOwnership(_projectOwner);

        projectStatus = ProjectPhase.CONFIG;
    }

    /// @notice circit breaker to pause certin funnctinallity, inherits of openzepllin library
    /// @return returns bool if paused
    function pause() public onlyOwner returns (bool) {
        _pause();
    }

    /// @notice circit breaker to unpause certin funnctinallity, inherits of openzepllin library
    /// @return returns bool if paused
    function unPause() public onlyOwner returns (bool) {
        _unpause();
    }

    // Configuration functions

    /// @notice updates hard cap, hardcap can stay at 0 to set no limit. Only callable when configurable enum is 0
    /// @param _amount uint of how many participants are needed
    /// @return returns the updated hardcap
    function updateHardCap(uint256 _amount)
        public
        onlyOwner
        isConfigPhase
        returns (uint256)
    {
        hardCap = _amount;
        emit LogHardCapUpdate(_amount);
        return _amount;
    }

    /// @notice updates reward amount in wei, Only callable when config enum is 0
    /// @param _amount uint in wei of reward
    /// @return retuns updated reward size
    function updateRewardAmount(uint256 _amount)
        public
        onlyOwner
        isConfigPhase
        returns (uint256)
    {
        rewardSize = _amount;
        emit LogRewardUpdate(_amount);
        return _amount;
    }

    /// @notice sets configurable enum to 1, disables configurable functions
    /// @return bool true
    function openResearchProjectRegistration()
        public
        onlyOwner
        isConfigPhase
        returns (bool)
    {
        projectStatus = ProjectPhase.REGESTRATION;
        emit LogProjectInRegistration(prjectId);
        return true;
    }

    // Registration functions
    /// @notice removes participannt from pending set to accepted set and adds params to struct when configurable enum is 1
    /// @param _address of the participant to accept
    /// @return bool indicatincing success or falure
    function acceptParticipnt(address _address)
        public
        onlyOwner
        isRegistrationPhase
        capNotReached
        returns (bool)
    {
        if (pendingApplicants.remove(_address)) {
            participants[_address].accepted = true;
            participants[_address].reward = rewardSize;
            acceptedParticipants.add(_address);
            participntCount += 1;
            emit LogAcceptedParticipnt(_address);
            return true;
        } else {
            return false;
        }
    }

    /// @notice removes participant from pending applicants when configurable enum is 1
    /// @dev could check exsistance
    /// @param _address of participant to reject
    function rejectParticipnt(address _address)
        public
        onlyOwner
        isRegistrationPhase
        returns (bool)
    {
        pendingApplicants.remove(_address);
        emit LogRejectedParticipnt(_address);
        return true;
    }

    /// @notice adds address to pending applicants set when configurable enum is 1
    /// @dev could check exsistance and revert id user is already in set
    /// @return bool indicating success
    function applyForResearchProject()
        public
        isRegistrationPhase
        capNotReached
        whenNotPaused
        returns (bool)
    {
        pendingApplicants.add(msg.sender);
        emit LogApplyForResearchProject(msg.sender);
        return true;
    }

    /// @notice sets configurable state to 2 if there is atleast 1 participant, contract has enough wei to pay them and configurable enum is 1
    /// @return bool indicating success
    function startResearchProject()
        public
        onlyOwner
        isRegistrationPhase
        whenNotPaused
        returns (bool)
    {
        require(participntCount > 0, "There are currentlly no participnts");
        require(
            address(this).balance >= participntCount * rewardSize,
            "Contract balance to low"
        );
        projectStatus = ProjectPhase.IN_PROGRESS;
        emit LogProjectStarted(prjectId);
        return true;
    }

    // In Progress functions
    /// @notice sets configurable state to 3
    /// @return returns bool indicating success
    function endResearchProject()
        public
        onlyOwner
        isInProgressPhase
        whenNotPaused
        returns (bool)
    {
        projectStatus = ProjectPhase.ENDED;
        emit LogProjectEnded(true);
        return true;
    }

    /// @notice sets addresses struct feild complete, to true. Allows patient to withdraw form contract when configurable enum is set to 2
    /// @param _address addres of the participant
    /// @return nool indicating success
    function participntObligationMet(address _address)
        public
        onlyOwner
        isInProgressPhase
        whenNotPaused
        returns (bool)
    {
        participants[_address].completed = true;
        return true;
    }

    // GETTERS
    /// @notice returns current details for the project
    /// @return owner - address of owner
    /// @return id - id of project assigned by factory
    /// @return title - title of the proejct
    /// @return entity - name of the entity
    /// @return cap - hardcap for participants
    /// @return participntsCount - nnumber of participants
    /// @return reward - amount of wei rewarded to participant
    /// @return status - the configurable state the contract is in
    function getProjectDetails()
        public
        view
        returns (
            address owner,
            uint256 id,
            string memory title,
            string memory entity,
            uint256 cap,
            uint256 participntsCount,
            uint256 reward,
            ProjectPhase status
        )
    {
        return (
            projectOwner,
            prjectId,
            projectName,
            entityName,
            hardCap,
            participntCount,
            rewardSize,
            projectStatus
        );
    }

    /// @notice the contracts balance
    /// @return contract balance wei
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /// @notice get addresses in pending set
    /// @return array of addresses
    function getPendingParticipnts() public view returns (address[] memory) {
        uint256 arrLength = pendingApplicants.length();
        address[] memory _outArray = new address[](arrLength);
        for (uint256 i = 0; i < arrLength; i++) {
            address addr = pendingApplicants.at(i);
            _outArray[i] = addr;
        }

        return _outArray;
    }

    /// @notice get addresses in accepted set
    /// @return array of addresses
    function getAcceptedParticipants() public view returns (address[] memory) {
        uint256 arrLength = acceptedParticipants.length();
        address[] memory _outArray = new address[](arrLength);
        for (uint256 i = 0; i < arrLength; i++) {
            address addr = acceptedParticipants.at(i);
            _outArray[i] = addr;
        }

        return _outArray;
    }

    /// @notice returns patient struct for address
    /// @return accepted - participant accepted bool
    /// @return completed - has participant completed obligation bool
    /// @return reward - reward to be awarded to participant
    function getParticipant(address _address)
        public
        view
        returns (
            bool accepted,
            bool completed,
            uint256 reward
        )
    {
        return (
            participants[_address].accepted,
            participants[_address].completed,
            participants[_address].reward
        );
    }

    /// @notice allows address to withdraw wei from contract if completed for participant is true
    function withdraw() public hasEnded whenNotPaused {
        require(rewardSize > 0, "No reward to be received");
        require(
            participants[msg.sender].completed,
            "Research obligation not met"
        );
        uint256 amount = participants[msg.sender].reward;
        participants[msg.sender].reward = 0;
        msg.sender.transfer(amount);
    }

    receive() external payable {}

    fallback() external payable {}
}
