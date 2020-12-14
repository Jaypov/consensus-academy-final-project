// "SPDX-License-Identifier: UNLICENSED"
pragma solidity ^0.6.0;

contract Configurable {
    ProjectPhase public projectStatus;

    enum ProjectPhase {CONFIG, REGESTRATION, IN_PROGRESS, ENDED}

    modifier isConfigPhase() {
        require(
            projectStatus == ProjectPhase.CONFIG,
            "Configurable: Project no longer in CONFIG stage"
        );
        _;
    }

    modifier isRegistrationPhase() {
        require(
            projectStatus == ProjectPhase.REGESTRATION,
            "Configurable: Project no longer in REGESTRATION stage"
        );
        _;
    }

    modifier isInProgressPhase() {
        require(
            projectStatus == ProjectPhase.IN_PROGRESS,
            "Configurable: Project no longer in IN PROGRESS"
        );
        _;
    }

    modifier hasEnded() {
        require(projectStatus == ProjectPhase.ENDED, "Project has not ended");
        _;
    }
}
