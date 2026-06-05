import { existsSync, writeFileSync, appendFileSync } from "node:fs";
import { exec } from "node:child_process";
import * as Ably from "ably";

const LOG_FILE = "~/.notification-client.log";

function Logger(type, value) {
  const timestamp = new Date().getTime();
  const logEntry = `${timestamp} | ${type} | ${JSON.stringify(value)}`;
  try {
    if (existsSync(LOG_FILE)) {
      appendFileSync(LOG_FILE, logEntry);
    } else {
      writeFileSync(LOG_FILE, logEntry);
    }
  } catch (err) {
    console.error(`Error Logging To File: ${err.message}`);
  }
}

function systemNotification(message) {
  const safeMessage = message
    .replace("[[ ", "")
    .replace(" ]]", "")
    .replace(/'/g, "'\\''");
  const command = `termux-notification -t "${safeMessage}" --priority max --sound --vibrate 800`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error executing notification: ${err.message}`);
      Logger("[[ Notification API Error ]]", err);
      return;
    }

    if (stderr) {
      console.error(`CLI error: ${stderr}`);
      Logger("[[ Command Execution Error ]]", stderr);
      return;
    }

    return stdout;
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
    Logger("[[ Runtime Error ]]", err);
    process.exit(1);
  }
}

main();
