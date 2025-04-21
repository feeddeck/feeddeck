import { createClient } from "jsr:@supabase/supabase-js@2";

import { generateKey } from "../../_shared/utils/encrypt.ts";
import { log } from "../../_shared/utils/log.ts";
import { generateAppleSecretKey } from "./apple-secret-key.ts";
import { getFeed } from "../../_shared/feed/feed.ts";

export const runTools = async (args: string[]): Promise<void> => {
  /**
   * The "tools generate-key" command can be invoked via the following command:
   *   deno run --no-lock --allow-net --allow-env ./supabase/functions/_cmd/cmd.ts tools generate-key
   */
  if (args.length === 2 && args[0] === "tools" && args[1] === "generate-key") {
    const data = await generateKey();
    log("info", "Encryption key was generated", {
      key: data.rawKey,
      iv: data.iv,
    });
    return;
  }

  /**
   * The "tools generate-apple-secret-key" command can be invoked via the
   * following command:
   *   deno run --no-lock --allow-env --allow-read ./supabase/functions/_cmd/cmd.ts tools generate-apple-secret-key <KEY-ID> <TEAM-ID> <SERVICE-ID> <FILE>
   */
  if (
    args.length === 6 &&
    args[0] === "tools" &&
    args[1] === "generate-apple-secret-key"
  ) {
    const data = await generateAppleSecretKey(
      args[2],
      args[3],
      args[4],
      args[5],
    );
    log("info", "Encryption key was generated", {
      kid: data.kid,
      exp: new Date(data.exp * 1000).toString(),
      jwt: data.jwt,
    });
    return;
  }

  /**
   * The "tools get-feed" command can be invoked via the following command:
   *   deno run --no-lock --allow-env --allow-read --allow-net ./supabase/functions/_cmd/cmd.ts tools get-feed <SOURCE>
   *
   * The command gets a source and the items for a provided source. The provided
   * source must contain the type and options to get a feed. All other required
   * properties for a source are added by the function.
   *
   * Example:
   *   deno run --no-lock --allow-env --allow-read --allow-net ./supabase/functions/_cmd/cmd.ts tools get-feed '{"type": "reddit", "options": {"reddit": "/r/kubernetes"}}'
   */
  if (args.length === 3 && args[0] === "tools" && args[1] === "get-feed") {
    const { source, items } = await getFeed(
      createClient("http://localhost:54321", "test123"),
      undefined,
      { id: "", tier: "free", createdAt: 0, updatedAt: 0 },
      {
        ...JSON.parse(args[2]),
        id: "",
        columnId: "mycolumn",
        userId: "myuser",
      },
      undefined,
    );
    log("info", "Add source", {
      source: source,
      items: items,
    });
    return;
  }
};
