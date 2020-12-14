# Consensys academy - final project

## Project description

#### Problem i am addressing

In the UK at all of our GP surgerys we have two companies that implement our EHR (electronic health records) infulstructure as well as a hadful more that are run in a hospital setting only. This data is siloed, a pain to obtain and is not iteroprable (between GP and hospital).

Aswell as the data being hard to obtain for patints, it is also hard for researchers to obtain and get express perssion to use this data because of bureaucracy.

Our government also monetize our health data by selling it to drug compaines (researchers) without knowlage or concent (concent is applied when you sign up to a GP, however patients are not told this and not told how they can opt out). The most recent example being, giving over millions of medical records to american drug companies, again without knowlage or concent from the people who genrate that data (all of us).

I belive in giving patients the power over their healthcare and their data. This POC project aims to create a marketplace where researchers can submit research projects to a marketplace and allow patients to sign up to these projects. In return they receive payment for the use of their data. This would potentilly drive more much needed data into research projects as patients have an incetive to share it.

#### The project

Over the years a number of private companies in the UK have developed applications to allow patients to have access to their EHR data (through API's supplied by EHR providers), the basic idea of this project is to implment a medical data marketplace for researchers:

1. A researcher requests a project to be added to the marketplace, along with a fee set by the marketplace owner (the fee is to stop spam and pay the marketplace owner for the work it takes to verify the project requester, check liablities etc)

2. the marketplace owner does its due diligence to ensure the project has liscences, check its validity, confirm legal aspects and so on. Once the research project has been vetted the marketplace owner can accept or reject the project

3. Once the marketplace owner accepts the project the contract uses a contract factory design pattern to deploy the projects smart contract and pass ownership of the contract over to the requester

4. the project starts in a configuration stage, at this point no participants can join the project. The owner of the project contract must

   1. (optinal) Set a hard cap (if hardcap is 0 indefinate participants can apply)
   2. (optinal) Set a reqard size which will be paid to participants on completion

5. The project is then set to registration stage, at which point the hardcap and reward size can no longer be updated. Participants can now apply to be part of the research project and the project owner can either accept or reject the participant (based on off chain requirements)

6. The project owner can then set the contract to the "In Progress" state at which point no more participants can sign up. But first they must found the contract with enough founds to pay the accepted participants (participants \* reward size). The patient satisfies the projects requirements off chain (ie, sends medical data to the reseacher) and once the these requirments are met the project contract owner can set the patients obligation as met in the contract.

7. The Project owner ends the project, at which point the only function that can run is the withdraw function. Participants can now send a transaction to withdraw their reward (provided they were marked as obligation met in the previous step)

### Notes

As the project is not being marked based on its UI and i had very limited time to be able to complete the task, the UI is abit hacky. However all the essentil elments to show integration are in there (hooking into injected metamask instance, sending transactions, UI reacting to contract events)

1. only essential errors are displayed, all other errors are logged in the console

2. there will be bugs (please follow steps in the video recording, to see the user story described above, any divergance may lead to bugs)

3. there are a few cases where there are unecassery re renders, so data will flash up and dissapear untill the app reaches its final state

## Installation

install dependancies

due to truffle dependancys this project must be run on node V12

```javascript
nvm use 12
```

```javascript
yarn install
```

boot up blockchain, run tests and migrate contracts

```javascript
yarn bootstrap
```

in a new terminal window, boot up the UI (wait for previous step to full complete, ABI's must be generated, contracts deployed and tests passed, tests are verbose you will see when they pass)

```javascript
yarn dev
```

visit the followingn url in the borwser

```javascript
localhost: 3000;
```

## Usage

When the UI is booted up go to the terminal ganache is running in and import the top 3 private keys into metamask (the first account is the owner of the merkatplace contract. The market place contract is what powers the "admin" page)
