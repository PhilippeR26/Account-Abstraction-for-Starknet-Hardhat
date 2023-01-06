// testOZstd.ts
// deploy an account abstraction with OZ0.5.1 account codesource.
// Automatically deployed in devnet.
// launch with : npx hardhat run scripts/testOZstd.ts
import { starknet } from "hardhat";
import LogC from "../src/logColors";
import { MyAccountOZstd } from "./AAaccount-OZstd"
import { hash } from "starknet";
import axios from "axios";
import { adaptAddress } from "../src/util";
import { generateKeys } from "@shardlabs/starknet-hardhat-plugin/dist/src/account-utils";

async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const hre = await import("hardhat");
    const whichNetwork = hre.config.starknet.network;
    console.log("\nworking in network : " + LogC.fg.yellow + whichNetwork, LogC.reset, "\nConnect predeployed wallet 0.");
    const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
    const parentAccount = await starknet.OpenZeppelinAccount.getAccountFromAddress(
        ListOfWallet[0].address,
        ListOfWallet[0].private_key
    );

    //creation account OZ
    console.log("Creation of OZ account");
    const accountOZ = await starknet.OpenZeppelinAccount.createAccount();
    console.log("accountOZ.address =", accountOZ.address);
    const { data: answerOZ } = await axios.post('http://127.0.0.1:5050/mint', { "address": accountOZ.address, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    await accountOZ.deployAccount();

    // creation AAacount
    // if never declared in the network :
    console.log("declaration of contract");
    const contractFactory = await hre.starknet.getContractFactory(MyAccountOZstd.MYACCOUNTPATH);
    const classHash = await parentAccount.declare(contractFactory);
    console.log("classHash =", classHash);
    // if already declared in the network, just initialize classHash with the result of this .declare

    const signer = generateKeys("0x1234567");
    const pubKey = signer.publicKey;
    const privKey = signer.privateKey;

    console.log("account pubKey =", pubKey);
    const pubKeyNum = BigInt(pubKey).toString()
    console.log("account pubKeyNum =", pubKeyNum);
    console.log("account private key =", privKey);

    const constructorAccount = [
        BigInt(pubKey).toString()
    ];

    const myAccount = await MyAccountOZstd.createAccount(constructorAccount, { classH: classHash, salt: pubKey, privateKey: privKey });
    console.log("myAccount.address =", myAccount.address);

    // fund the account before deploying it
    const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": myAccount.address, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    console.log('Answer mint =', answer);

    // deploy the account
    const deploymentTxHash = await myAccount.deployAccount();

    console.log("\n✅ AAccount deployed at = " + LogC.fg.green + myAccount.addressAccount + LogC.reset);

    // connect to the account
    const existingAccount = await MyAccountOZstd.getAccountFromAddress(myAccount.address, privKey);
    console.log("account also connected from address =", existingAccount.address);
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

