# Common Attacks

#### Denial of Service Attack

My initial idea was to automatically send founds to all participants once the project had ended, however this approach was prone to a dinial of service attack by a malicious actor putting in a contract address that has a revert in its fullback function. So for this reason i went for pull over push approache

#### Re-entracy Attack

In the withdraw function i have protected against a rentrancy attack on the smart contracts founds by changinng the state veariable (the users balance), before doing the withdrawal.
