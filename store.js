const { SessionRecord } = require("libsignal");
const fs = require('fs');

class Store {
    constructor() {
        this.sessions = {};
        this.preKeys = {};
        this.signedPreKeys = {};
    }

    loadSession = async (id) => {
        const sess = this.sessions[id]
        if(sess) {
			return SessionRecord.deserialize(sess)
		}
    }

    storeSession = async (id, session) => {
        this.sessions[id.toString()] = session.serialize()
    }

    storePreKey = (keyId, keyPair) => {
        this.preKeys[keyId] = keyPair;
    }

    loadPreKey = (keyId) => {
        let res = this.preKeys[keyId];
        if (res !== undefined) {
            res = {
                pubKey: res.keyPair.pubKey,
                privKey: res.keyPair.privKey
            };
        }

        return Promise.resolve(res);
    }

    removePreKey = (preKeyId) => {
        delete this.preKeys[preKeyId];
    }

    storeSignedPreKey = (keyId, keyPair) => {
        this.signedPreKeys[keyId] = keyPair
    }

    loadSignedPreKey = (keyId) => {
        let res = this.signedPreKeys[keyId]
        if (res !== undefined) {
            res = {
                pubKey: res.keyPair.pubKey,
                privKey: res.keyPair.privKey
            };
        }

        return Promise.resolve(res);
    }

    storeRegistrationId = (registrationId) => {
        this.registrationId = registrationId;
    }

    getOurRegistrationId = () => {
        return Promise.resolve(this.registrationId);
    }

    storeIdentityKey = (identityKey) => {
        this.identityKey = identityKey;
    }

    getOurIdentity = () => {
        return Promise.resolve(this.identityKey)
    }

    isTrustedIdentity = () => {
        return true;
    }
}

module.exports = Store