const fs = require("fs");
const path = require("path");
const createRelayServer = require("libp2p-relay-server");
const PeerId = require("peer-id");
// :) IP
// 122.164.242.24
// Buhan IP
// 122.164.242.24
const getRelayPeerId = async () => {
  try {
    const peerIdPath = path.join(__dirname, "./relay-peer-id.json");
    const idJson = require(peerIdPath);
    return await PeerId.createFromJSON(idJson);
  } catch (err) {
    console.log(err);
  }
};

const main = async () => {
  const relay = await createRelayServer({
    peerId: await getRelayPeerId(),
    listenAddresses: [`/ip4/0.0.0.0/tcp/${process.env.PORT || 20401}`],
    // announceAddresses: [
    //   `/dns4/decloud-relay.herokuapp.com/tcp/${process.env.PORT || 20401}`,
    // ],
  });
  console.log(`libp2p relay starting with id: ${relay.peerId.toB58String()}`);
  await relay.start();
  const relayMultiaddrs = relay.multiaddrs.map(
    (m) => `${m.toString()}/p2p/${relay.peerId.toB58String()}`
  );

  relay.on("peer:discovery", async (peerId) => {
    console.log(`[DISCOVERED]: ${peerId.toB58String()}`);
  });

  relay.connectionManager.on("peer:connect", (connection) => {
    console.log("[CONNECTED]:", connection.remotePeer.toB58String());
  });

  console.log(relayMultiaddrs);
};
main();
