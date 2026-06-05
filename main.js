import { exec } from "node:child_process";
import * as Ably from "ably";

function systemNotification(message) {
  const safeMessage = message
    .replace("[[ ", "")
    .replace(" ]]", "")
    .replace(/'/g, "'\\''");
  const command = `termux-notification -t "${safeMessage}" --priority max --sound --vibrate 800`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error executing notification: ${err.message}`);
      return;
    }
    if (stderr) {
      console.error(`CLI error: ${stderr}`);
    }
  });
}

async function main() {
  try {
    const key = process.env.ABLY_API_KEY;
    if (!key) throw new Error("[!] Please provide Ably API Key.");
    const realtimeClient = new Ably.Realtime({ key });

    await realtimeClient.connection.once("connected");
    console.log("[+] Connected!");

    const channel = realtimeClient.channels.get("notify");
    await channel.subscribe(({ data }) => systemNotification(data));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

main();
