// testBB.ts
// deploy an account abstraction.
// Automatically deployed in devnet.
import { starknet } from "hardhat";
//import hre from "hardhat";
import LogC from "../src/logColors";
import { MyAccountSimple } from "./AAaccount"
import { Call, hash, RawCalldata, number, ec } from "starknet";
import axios from "axios";

import { adaptAddress } from "../src/util";
import { calculateDeployAccountHash, generateKeys } from "@shardlabs/starknet-hardhat-plugin/dist/src/account-utils";
import { StarknetContract } from "hardhat/types";
import { Account } from "../src/HHstarknetAbstractAccount/accountAA";
import { StarknetChainId } from "@shardlabs/starknet-hardhat-plugin/dist/src/constants";

async function main() {
    // Recover the starknet:network name defined in the hardhat.config.ts file
    const hre = await import("hardhat");
    const whichNetwork = hre.config.starknet.network;
    // console.log("\nworking in network : " + LogC.fg.yellow + whichNetwork, LogC.reset, "\nConnect predeployed wallet 0.");
    // const ListOfWallet = await starknet.devnet.getPredeployedAccounts();
    // const parentAccount = await starknet.OpenZeppelinAccount.getAccountFromAddress(
    //     ListOfWallet[0].address,
    //     ListOfWallet[0].private_key
    // );

    // // avec children contract
    // const sig1 = 12127940451287457523068471121774543800152629225110401296956973331192462308n;
    // const sig2 = 1296746033971043408198408231841889551545654453340824574870385472655268470594n;
    // const pubKey = 1098377157898629946571614844583422311425675589668982787103879603004212846503n;
    // const privKey = "0x1234";
    // const addressAccount = "0x72e365caadac9c271813997cfda296cf5d882c4423b894cff5c4d6abcf74c07";
    // const administrator = 3562055384976875123115280411327378123839557441680670463096306030682092229914n;
    // const classHash = "0x4f3a560caddbaeeedeebf1de458b0feb2f5bfa4fd9e24a3d5999b0b3acd5fcc";
    // const messageHashExpected = 1484610528465226937030305702908375864976132515860965277042362332901054411176n;

    const chainID = hre.starknet.networkConfig.starknetChainId ?? StarknetChainId.TESTNET

    // avec contract OZ
    const sig1 = 746725531038044712151143797622638171467599227628120256692770427189602238614n;
    const sig2 = 1881781994341518692213307820552184882996289650611004233844582672661808586265n;
    const pubKey = 961402640779120116494199688070946729708169893186414498106599600291824840092n;
    const privKey = "0x1234567";
    const addressAccount = "0x2fd4ff151683de2fca6dba4390bde40557ada2341eebcbdbf418d0cf100f623";
    const classHash = "0x185bc35bc2220ac5fca417d9c106f87ff8512381bb6efd6c677f743b2c250e6";
    const messageHashExpected = 3579354437675527847777040940817191777155852303405951063114691804655954627765n;

    const salt = pubKey;
    const constructorData: string[] = [pubKey.toString()];
    // .map((val) => BigInt(val).toString())
    const starkKeyPair = ec.getKeyPair(privKey);

    const DEPLOY_ACCOUNT = "2036277798190617858034555652763252"; // "0x6465706c6f795f6163636f756e74";

    const msgHash = calculateDeployAccountHash(
        addressAccount,
        constructorData,
        pubKey.toString(),
        classHash,
        "0x00", //maxFee
        chainID
    );
    const callD: string[] = [classHash, salt.toString(), ...constructorData];
    const intermHash = hash.computeHashOnElements(callD);
    console.log("callD Hash =", intermHash);
    const msgHash2 = hash.computeHashOnElements(
        [DEPLOY_ACCOUNT,
            "0x01", //version
            addressAccount,
            "0x0", //entrypoint
            // hash.getSelectorFromName('constructor'), //entrypoint
            intermHash,
            "0x00", //maxFee
            chainID,
            "0x0" //nonce
        ]);
    console.log("msgHash Num =", BigInt(msgHash).toString());
    console.log("msgHash2 Num =", BigInt(msgHash2).toString());
    const signature = ec.sign(starkKeyPair, msgHash);
    //const result = ec.verify(starkKeyPair, msgHash, [sig1.toString(), sig2.toString()]);
    const result = ec.verify(starkKeyPair, msgHash, signature);

    console.log("result =", result);
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(LogC.bg.red, LogC.bright, LogC.fg.white, error, LogC.reset);
        process.exit(1);
    });

