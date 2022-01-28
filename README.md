# Test hypercore replication over dht-relay

## Setup

```
npm install
npm run setup.js
```

## Test

Node:

```
node replicate.js
```

should see:

```bash
Connecting to peer: <remote>
Replicating core from peer: <remote>
Got data:  { foo: 'bar' }
```

Browser:

```
npm run start
```

Then visit http://localhost:1234

should see:

```log
connecting to peer: <remote>
Replicating core from peer: <remote>
Error: Noise handshake failed
    at NoiseSecretStream._onhandshakert (bundle-replicate.js:2060)
    at NoiseSecretStream._open (bundle-replicate.js:2107)
    at WritableState.updateNonPrimary (bundle-replicate.js:16054)
    at WritableState.update (bundle-replicate.js:16027)
    at WritableState.updateWriteNT (bundle-replicate.js:16352)
```
