import { log } from "../_shared/utils/log.ts";
import { runScheduler } from "./scheduler/scheduler.ts";
import { runWorker } from "./worker/worker.ts";
import { runTools } from "./tools/tools.ts";

/**
 * Next to the Supabase Edge functions we also have to create an command which
 * can be run inside of a Docker container. This command is used to start the
 * scheduler or worker, to refetch the feeds for all user sources.
 */
const main = (args: string[]) => {
  if (args.length === 1 && args[0] === "scheduler") {
    log("info", "Start scheduler...");
    runScheduler()
      .then(() => {
        Deno.exit(0);
      })
      .catch((err) => {
        log("error", "Scheduler crashed", { error: err });
        Deno.exit(1);
      });
  } else if (args.length === 1 && args[0] === "worker") {
    log("info", "Start worker...");
    runWorker()
      .then(() => {
        Deno.exit(0);
      })
      .catch((err) => {
        log("error", "Worker crashed", { error: err });
        Deno.exit(1);
      });
  } else if (args.length >= 2 && args[0] === "tools") {
    log("info", "Start tools...");
    runTools(args)
      .then(() => {
        Deno.exit(0);
      })
      .catch((err) => {
        log("error", "Tools crashed", { error: err });
        Deno.exit(1);
      });
  } else {
    log("error", "Invalid command-line arguments", { args: args });
    Deno.exit(1);
  }
};

main(Deno.args);
