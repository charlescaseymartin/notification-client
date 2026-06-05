import { exec } from "node:child_process";
import * as Ably from "ably";

function systemNotification(title, message) {
  const safeTitle = title.replace(/'/g, "'\\''");
  const safeMessage = message.replace(/'/g, "'\\''");
  const command = `termux-notification -t '${safeTitle}' -c '${safeMessage}' --sound`;

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
    await channel.subscribe(({ name, data }) => {
      systemNotification(name, data);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

main();
