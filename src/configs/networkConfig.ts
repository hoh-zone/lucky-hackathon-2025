import {getFullnodeUrl, SuiClient} from "@mysten/sui/client";
import {createNetworkConfig} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";
import {BrowserPasskeyProvider, BrowserPasswordProviderOptions, PasskeyKeypair} from "@mysten/sui/keypairs/passkey";
import {getAllowlistedKeyServers, SealClient, SessionKey} from "@mysten/seal";

type Network = "mainnet" | "testnet";

const network = (process.env.NEXT_PUBLIC_NETWORK as Network) || "testnet";

const {networkConfig, useNetworkVariable, useNetworkVariables} = createNetworkConfig({
    mainnet: {
        url: getFullnodeUrl("mainnet"),
        variables: {
            Package: "",
            Publisher: "",
            UpgradeCap: ""
        }
    },
    testnet: {
        url: getFullnodeUrl("testnet"),
        variables: {
            Package: "0x1a164861794ca55433c7c2ecef1b50efe53398e84157fbeb4ecb2a0ff3f3e732",
            Publisher: "0x3cb51a12a0c53cc120e32ee044db8130a015d5291b337af4d95092f0cbbeb6c5",
            UpgradeCap: "0x4843e1cfe2e30fc5e39bd981ecac84354a2bf2720fa398f26eacec3ec6228f65"
        }
    }
});

const suiClient = new SuiClient({
    url: networkConfig[network].url
});

const passkeySavedName = "Luckcky Sui";
const authenticatorAttachment = "cross-platform";
let passkeyProvider: BrowserPasskeyProvider;
function getPasskeyProvider(rpId: string) {
    if (!passkeyProvider) {
        passkeyProvider = new BrowserPasskeyProvider(passkeySavedName, {
            rpName: passkeySavedName,
            rpId,
            authenticatorSelection: {
                authenticatorAttachment,
            },
        } as BrowserPasswordProviderOptions);
    }
    return passkeyProvider;
}

let keypair: PasskeyKeypair;
function getPasskeyKeypair(rpId: string, publicKeyStr: string) {
    if (keypair && keypair.getPublicKey().toRawBytes().toString() === publicKeyStr)
        return keypair;
    const publicKey = new Uint8Array(publicKeyStr.split(',').map(item => Number(item)));
    const passkeyProvider = getPasskeyProvider(rpId);
    keypair = new PasskeyKeypair(publicKey, passkeyProvider);
    return keypair;
}

const sealClient = new SealClient({
    // @ts-expect-error: Type error due to software package issues
    suiClient,
    serverObjectIds: getAllowlistedKeyServers(network),
    verifyKeyServers: false,
});

let sessionKey: SessionKey;
async function getSessionKey(rpId: string, publicKeyStr: string) {
    // get passkey pair
    const keypair = getPasskeyKeypair(rpId, publicKeyStr);
    const address = keypair.toSuiAddress();
    // exist
    if (sessionKey && !sessionKey.isExpired() && sessionKey.getAddress() === address)
        return sessionKey;
    // new session
    sessionKey = new SessionKey({
        address,
        packageId: networkConfig[network].variables.Package,
        ttlMin: 30
    });
    // get message
    const message = sessionKey.getPersonalMessage();
    // sign message
    const {signature} = await keypair.signPersonalMessage(message);
    // set message
    await sessionKey.setPersonalMessageSignature(signature);
    return sessionKey;
}

type NetworkVariables = ReturnType<typeof useNetworkVariables>;

function getNetworkVariables() {
    return networkConfig[network].variables;
}

function createBetterTxFactory<T extends Record<string, unknown>>(
    fn: (tx: Transaction, networkVariables: NetworkVariables, params: T) => Transaction
) {
    return (params: T) => {
        const tx = new Transaction();
        const networkVariables = getNetworkVariables();
        return fn(tx, networkVariables, params);
    }
}

export type {NetworkVariables};
export {
    network,
    useNetworkVariable,
    useNetworkVariables,
    networkConfig,
    suiClient,
    createBetterTxFactory,
    getPasskeyProvider,
    sealClient,
    getPasskeyKeypair,
    getSessionKey,
}