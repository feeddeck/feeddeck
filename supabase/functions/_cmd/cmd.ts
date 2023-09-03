import { generateKey } from "../_shared/utils/encrypt.ts";
import { log } from "../_shared/utils/log.ts";
import { runScheduler } from "./scheduler/scheduler.ts";
import { runWorker } from "./worker/worker.ts";
import { generateAppleSecretKey } from "./tools/tools.ts";

/**
 * Next to the Supabase Edge functions we also have to create an command which can be run inside of a Docker container.
 * This command is used to start the scheduler or worker, to refetch the feeds for all user sources.
 */
const main = (args: string[]) => {
  if (args.length === 1 && args[0] === "scheduler") {
    log("info", "Start scheduler...");
    runScheduler().then(() => {
      Deno.exit(0);
    }).catch((err) => {
      log("error", "Scheduler crashed", { error: err.toString() });
      Deno.exit(1);
    });
  } else if (args.length === 1 && args[0] === "worker") {
    log("info", "Start worker...");
    runWorker().then(() => {
      Deno.exit(0);
    }).catch((err) => {
      log("error", "Worker crashed", { error: err.toString() });
      Deno.exit(1);
    });
  } else if (
    args.length === 2 && args[0] === "tools" &&
    args[1] === "generate-key"
  ) {
    /**
     * The "tools generate-key" command can be invoked via the following command:
     * deno run --allow-net --allow-env --import-map=./supabase/functions/import_map.json ./supabase/functions/_cmd/cmd.ts tools generate-key
     */
    generateKey().then((data) => {
      log("info", "Encryption key was generated", {
        key: data.rawKey,
        iv: data.iv,
      });
      Deno.exit(0);
    }).catch((err) => {
      log("error", "Failed to generate encryption key", {
        error: err.toString(),
      });
      Deno.exit(1);
    });
  } else if (
    args.length === 6 && args[0] === "tools" &&
    args[1] === "generate-apple-secret-key"
  ) {
    /**
     * The "tools generate-key" command can be invoked via the following command:
     * deno run --allow-env --allow-read --import-map=./supabase/functions/import_map.json ./supabase/functions/_cmd/cmd.ts tools generate-apple-secret-key <KEY-ID> <TEAM-ID> <SERVICE-ID> <FILE>
     */
    generateAppleSecretKey(args[2], args[3], args[4], args[5]).then((data) => {
      log("info", "Encryption key was generated", {
        kid: data.kid,
        exp: new Date(data.exp * 1000).toString(),
        jwt: data.jwt,
      });
      Deno.exit(0);
    }).catch((err) => {
      log("error", "Failed to generate encryption key", {
        error: err.toString(),
      });
      Deno.exit(1);
    });
  } else {
    log("error", "Invalid command-line arguments", { args: args });
    Deno.exit(1);
  }
};

main(Deno.args);
