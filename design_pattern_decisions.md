# Design Patterns

If i were to do the project again i would change from the factory design pattern. Id allow for the project contract to be an abrstract contract so that diffrent research projects could add their own functionallity for the obligationMet funtionallity and use a contract proxy pattern to handle deployments and delegating calls

#### Factory Pattern

I have chosen to use the factory pattern as a core pattern in my marketplace contract. I have used this pattern so that manual validation of projects off chain can occur before deployment. Also so that users can validate against the marketplace contract to ensure a depolyed project contract is verified by the market place (this fights against people just deploying the project contract to dupe people).

#### Mapping Iterator (using openzeppelin enumorator)

I needed a way to store structures that i could both modify easily and iterate easy so i could return array lists of id's to the front end (as these id's used to retreive the struct data, from a mapping, are not known by the contract owner, who is the person/system that needs to use them).

I used openzepplins enumerators as they implment a pattern that makes mappings (seem) itterable and add array like functionallity. when getting all ID's in the list the enurmable set is itterated over and constructs an array of ID's to send to the requester. thes id's can thenn me used the request teh rest of the struct from the contract.

side note: I also do a bunch of adding and removing items so instead of using a simple array i have used enumarable sets, as the array like functionally these enumarable sets provide make it easier for me to manipulate "arrays"

#### Access restriction

I have used access restriction on both contracts as only one person should be responsable for configuring the contracts. Some functions in both contracts must be callable by anyone so access restriction is not applied

#### Pull over push

it is highly recomended by everyone to use push ovr pull payments as you can never trust external calls to execute without throwing an error. Because this is highly recomended everywher throuhout the community i have used it for user withdrawls of rewarded founds
