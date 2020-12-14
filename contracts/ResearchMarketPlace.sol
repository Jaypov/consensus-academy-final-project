// "SPDX-License-Identifier: UNLICENSED"
pragma solidity ^0.6.0;

import "./ResearchProject.sol";

/// @title A marketplace factory for medical research projects
/// @author Jay Povey
/// @notice Sets up a marketplace and sets one owner
contract ResearchMarketPlace is Ownable, Pausable {
    using EnumerableSet for EnumerableSet.UintSet;

    uint256 private applicationFee = 0;
    uint256 private projectsCount = 0;
    enum StudyStatus {REQUESTED, ACCEPTED, REJECTED}

    struct ResearchProjectInfo {
        StudyStatus status;
        address owner;
        address projectContract;
        string projectName;
        string entityName;
        string email;
        string phone;
        uint256 projectId;
    }

    EnumerableSet.UintSet private researchProjectRequests;
    EnumerableSet.UintSet private researchProjectAccepted;
    EnumerableSet.UintSet private researchProjectRejected;

    mapping(uint256 => ResearchProjectInfo) private researchProjects;

    event LogFeeUpdated(uint256 applicationFee);
    event LogResearchProjectRequest(address applicant, uint256 projectId);
    event LogResearchProjectAccepted(address applicant, uint256 id);
    event LogResearchProjectRejected(address applicant, uint256 id);

    /// @notice allows for setting fee on contract initilization
    /// @param _feePrice fee marketplace takes for offchain administration. Also prevents spam
    constructor(uint256 _feePrice) public {
        applicationFee = _feePrice;
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

    /// @notice updates marketplace fee, sender must pay fee to reqest project concideration (function: requestResearchPrjoect)
    /// @param _feePrice amount of wei the fee should be
    /// @return returns the fee price set
    function updateFeePrice(uint256 _feePrice)
        public
        onlyOwner
        returns (uint256)
    {
        applicationFee = _feePrice;
        emit LogFeeUpdated(_feePrice);
        return _feePrice;
    }

    /// @notice sender can set project details
    /// @dev should add param validationn
    /// @param projectName Descriptive title of the project
    /// @param email Contact email particapnts can reach project owner on
    /// @param entityName Name of the entity deplying the project (eg cancer research)
    /// @param phone Phone number participants can reach project owner on
    function requestResearchPrjoect(
        string memory projectName,
        string memory email,
        string memory entityName,
        string memory phone
    ) public payable whenNotPaused {
        require(
            msg.value == applicationFee,
            "ResearchMarketPlace: Fee requirement not met"
        );
        projectsCount += 1;

        researchProjects[projectsCount].status = StudyStatus.REQUESTED;
        researchProjects[projectsCount].owner = msg.sender;
        researchProjects[projectsCount].projectName = projectName;
        researchProjects[projectsCount].email = email;
        researchProjects[projectsCount].phone = phone;
        researchProjects[projectsCount].projectId = projectsCount;
        researchProjects[projectsCount].entityName = entityName;

        researchProjectRequests.add(projectsCount);
        emit LogResearchProjectRequest(msg.sender, projectsCount);
    }

    /// @notice factory function, removes project from pending project and adds to accepted
    /// @notice Deploys a ptoject contract, sets owner and intial params set by requester on applying
    /// @notice sets the contract address in the exsisting project struct
    /// @param _id id of the prject in the requests list
    function acceptResearchProject(uint256 _id)
        public
        onlyOwner
        whenNotPaused
        returns (bool)
    {
        require(
            researchProjectRequests.contains(_id),
            "Project does not exsist"
        );
        researchProjectRequests.remove(_id);
        researchProjectAccepted.add(_id);
        researchProjects[_id].status = StudyStatus.ACCEPTED;

        ResearchProject project = new ResearchProject(
            researchProjects[_id].owner,
            researchProjects[_id].projectId,
            researchProjects[_id].projectName,
            researchProjects[_id].entityName
        );
        researchProjects[_id].projectContract = address(project);

        emit LogResearchProjectAccepted(researchProjects[_id].owner, _id);
        return true;
    }

    /// @notice rejects research prject, removes from requested EnumerableSet and adds to rejected
    /// @param _id id of the project to reject
    function rejectResearchProject(uint256 _id)
        public
        onlyOwner
        whenNotPaused
        returns (bool)
    {
        require(
            researchProjectRequests.contains(_id),
            "Project does not exsist"
        );
        researchProjectRequests.remove(_id);
        researchProjectRejected.add(_id);
        researchProjects[_id].status = StudyStatus.REJECTED;
        emit LogResearchProjectRejected(researchProjects[_id].owner, _id);
        return true;
    }

    // GETTERS
    /// @notice get marketplace fee price, state var private as only this contract should update
    /// @return feePrice uint256 - current fee price wei
    function getFeePrice() public view returns (uint256 feePrice) {
        return applicationFee;
    }

    /// @notice loops requested projects and creates uint256 array of project ID's
    /// @return uint256[] of project ID's
    function getPendingResearchProjects()
        public
        view
        returns (uint256[] memory)
    {
        uint256 arrLength = researchProjectRequests.length();
        uint256[] memory _outArray = new uint256[](arrLength);
        for (uint256 i = 0; i < arrLength; i++) {
            uint256 pid = researchProjectRequests.at(i);
            _outArray[i] = pid;
        }

        return _outArray;
    }

    /// @notice get information about a project
    /// @param _id id of the proejct
    function getResearchProjectById(uint256 _id)
        public
        view
        returns (
            address owner,
            string memory projectName,
            string memory email,
            string memory phone,
            string memory entityName,
            uint256 projectId,
            address projectContract,
            StudyStatus status
        )
    {
        require(
            researchProjectAccepted.contains(_id) ||
                researchProjectRequests.contains(_id) ||
                researchProjectRejected.contains(_id),
            "Project does not exsist"
        );

        ResearchProjectInfo memory project = researchProjects[_id];

        return (
            project.owner,
            project.projectName,
            project.email,
            project.phone,
            project.entityName,
            project.projectId,
            project.projectContract,
            project.status
        );
    }

    /// @notice loops accepted projects and creates uint256 array of project ID's
    /// @return uint256[] of project ID's
    function getAcceptedresearchProjects()
        public
        view
        returns (uint256[] memory)
    {
        uint256 arrLength = researchProjectAccepted.length();
        uint256[] memory _outArray = new uint256[](arrLength);
        for (uint256 i = 0; i < arrLength; i++) {
            uint256 pid = researchProjectAccepted.at(i);
            _outArray[i] = pid;
        }

        return _outArray;
    }

    /// @return returns balance of the contract
    function getMarketPlaceBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /// @notice sends contract balance to the owner
    function withdraw(uint256 amount)
        public
        onlyOwner
        whenNotPaused
        returns (bool)
    {
        require(
            amount <= address(this).balance,
            "Connot withdraw more than contract balance"
        );
        address(uint160(owner())).transfer(amount);
        return true;
    }
}
