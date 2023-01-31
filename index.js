const { keyhelper, SessionCipher, ProtocolAddress } = require("libsignal");
const SessionBuilder = require("libsignal/src/session_builder");
const Store = require("./store");

const decryptMessage = (sessionCipher, encryptedMessage) => {
    if (encryptedMessage.type === 3) {
        return sessionCipher.decryptPreKeyWhisperMessage(encryptedMessage.body)
    }

    return sessionCipher.decryptWhisperMessage(encryptedMessage.body)
}

const generateKeyBundle = (regId, identityKey, signedPreKey, preKey) => {
    return {
        registrationId: regId,
        identityKey: identityKey.pubKey,
        signedPreKey: {
            keyId: signedPreKey.keyId,
            publicKey: signedPreKey.keyPair.pubKey,
            signature: signedPreKey.signature,
        },
        preKey: {
            keyId: preKey.keyId,
            publicKey: preKey.keyPair.pubKey
        }
    }
}

// Initialization of Alice store
const aliceStore = new Store();

const aliceIdentityKeyPair = keyhelper.generateIdentityKeyPair()
const aliceRegId = keyhelper.generateRegistrationId();
const alicePreKey = keyhelper.generatePreKey(Math.floor(Math.random() * 27));
const aliceSignedPrekey = keyhelper.generateSignedPreKey(aliceIdentityKeyPair, Math.floor(Math.random() * 28))

aliceStore.storeRegistrationId(aliceRegId)
aliceStore.storeIdentityKey(aliceIdentityKeyPair)
aliceStore.storePreKey(alicePreKey.keyId, alicePreKey);
aliceStore.storeSignedPreKey(aliceSignedPrekey.keyId, aliceSignedPrekey)

const ALICE_ADDRESS = new ProtocolAddress('+393278994952', 1)

// Initialization of Bob store
const bobStore = new Store();

const bobIdentityKeyPair = keyhelper.generateIdentityKeyPair()
const bobRegId = keyhelper.generateRegistrationId();
const bobPreKey = keyhelper.generatePreKey(Math.floor(Math.random() * 28));
const bobSignedPrekey = keyhelper.generateSignedPreKey(bobIdentityKeyPair, Math.floor(Math.random() * 28))

bobStore.storeIdentityKey(bobIdentityKeyPair)
bobStore.storeRegistrationId(bobRegId)
bobStore.storePreKey(bobPreKey.keyId, bobPreKey);
bobStore.storeSignedPreKey(bobSignedPrekey.keyId, bobSignedPrekey)

const BOB_ADDRESS = new ProtocolAddress('+393278994953', 1)

async function main() {
    const aliceSessionCipher = new SessionCipher(aliceStore, BOB_ADDRESS)
    const bobSessionCipher = new SessionCipher(bobStore, ALICE_ADDRESS);

    // Initiate a session
    const aliceToBobSessionBuilder = new SessionBuilder(aliceStore, BOB_ADDRESS)
    const bobKeyBundle = generateKeyBundle(bobRegId, bobIdentityKeyPair, bobSignedPrekey, bobPreKey)
    aliceToBobSessionBuilder.initOutgoing(bobKeyBundle)

    const encryptedMessage1 = await aliceSessionCipher.encrypt(Buffer.from("Hi Bob"))
    const decryptedMessage1 = await decryptMessage(bobSessionCipher, encryptedMessage1)
    console.log("Bob to Alice [ENCRYPTED]:", encryptedMessage1.body.toString('base64'))
    console.log("Alice to Bob:", decryptedMessage1.toString())

    const encryptedMessage2 = await bobSessionCipher.encrypt(Buffer.from("Hi Alice"))
    const decryptedMessage2 = await decryptMessage(aliceSessionCipher, encryptedMessage2)
    console.log("Bob to Alice [ENCRYPTED]:", encryptedMessage2.body.toString('base64'))
    console.log("Bob to Alice:", decryptedMessage2.toString())
}

main();