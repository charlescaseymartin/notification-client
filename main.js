import * as Ably from "ably";

async function main() {
  try {
    const key = process.env.ABLY_API_KEY;
    if (!key) throw new Error("[!] Please provide Ably API Key.");
    const realtimeClient = new Ably.Realtime({ key });

    await realtimeClient.connection.once("connected");
    console.log("[+] Connected!");

    const channel = realtimeClient.channels.get("notify");
    await channel.subscribe(({ name, data }) => {
      console.log(`${name}: ${data}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

main();
