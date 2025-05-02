import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";
import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

import {
  FEEDDECK_SUPABASE_URL,
  FEEDDECK_SUPABASE_ANON_KEY,
  FEEDDECK_SUPABASE_SERVICE_ROLE_KEY,
} from "../_shared/utils/constants.ts";
import {
  assertEqualsItems,
  assertEqualsSource,
} from "../_shared/feed/utils/test.ts";

interface IUser {
  id: string;
  email: string;
  password: string;
  deckId: string;
  columnId: string;
  client?: SupabaseClient;
}

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const supabaseAdmin = createClient(
  FEEDDECK_SUPABASE_URL,
  FEEDDECK_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const createUser = async (user: IUser): Promise<void> => {
  user.client = createClient(
    FEEDDECK_SUPABASE_URL,
    FEEDDECK_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const { data, error } = await user.client.auth.signUp({
    email: user.email,
    password: user.password,
  });

  assertEquals(error, null);
  assertNotEquals(data, null);

  user.id = data.user!.id;
};

Deno.test("E2E Tests", async (t) => {
  const testUser1: IUser = {
    id: "",
    email: "testuser1@feeddeck.app",
    password: "testuser1",
    deckId: "",
    columnId: "",
  };
  const testUser2: IUser = {
    id: "",
    email: "testuser2@feeddeck.app",
    password: "testuser2",
    deckId: "",
    columnId: "",
  };

  await t.step("should create users", async () => {
    await createUser(testUser1);
    await createUser(testUser2);
  });

  await t.step("should not return settings", async () => {
    const { data, error } = await testUser1.client!.from("settings").select();
    assertEquals(error, null);
    assertEquals(data, []);
  });

  await t.step("should not return profiles", async () => {
    const { data, error } = await testUser1.client!.from("settings").select();
    assertEquals(error, null);
    assertEquals(data, []);
  });

  await t.step("should select / create / update / delete decks", async (t) => {
    let tmpDeckId = "";

    await t.step("should create decks", async () => {
      const res1 = await testUser1
        .client!.from("decks")
        .insert({ name: "testuser1 deck1", userId: testUser1.id })
        .select()
        .single();
      assertEquals(res1.error, null);
      assertNotEquals(res1.data, null);
      testUser1.deckId = res1.data.id;

      const res2 = await testUser1
        .client!.from("decks")
        .insert({ name: "testuser1 deck2", userId: testUser1.id })
        .select()
        .single();
      assertEquals(res2.error, null);
      assertNotEquals(res2.data, null);
      tmpDeckId = res2.data.id;
    });

    await t.step("should not create deck for other user", async () => {
      const res1 = await testUser2
        .client!.from("decks")
        .insert({ name: "testuser1 deck1 by testuser2", userId: testUser1.id })
        .select()
        .single();
      assertNotEquals(res1.error, null);
    });

    await t.step("should select deck", async () => {
      const res1 = await testUser1
        .client!.from("decks")
        .select()
        .eq("id", tmpDeckId)
        .single();
      assertEquals(res1.error, null);
      assertNotEquals(res1.data, null);
      assertEquals(res1.data.name, "testuser1 deck2");
    });

    await t.step("should not select deck of other user", async () => {
      const res1 = await testUser2
        .client!.from("decks")
        .select()
        .eq("id", tmpDeckId)
        .single();
      assertNotEquals(res1.error, null);
    });

    await t.step("should update deck", async () => {
      const res1 = await testUser1
        .client!.from("decks")
        .update({ name: "testuser1 deck2 updated" })
        .eq("id", tmpDeckId);
      assertEquals(res1.error, null);
      assertEquals(res1.data, null);

      const res2 = await testUser1
        .client!.from("decks")
        .select()
        .eq("id", tmpDeckId)
        .single();
      assertEquals(res2.error, null);
      assertNotEquals(res2.data, null);
      assertEquals(res2.data.name, "testuser1 deck2 updated");
    });

    await t.step("should not update deck of other user", async () => {
      const res1 = await testUser2
        .client!.from("decks")
        .update({ name: "testuser1 deck2 updated by testuser2" })
        .eq("id", tmpDeckId);
      assertEquals(res1.error, null);
      assertEquals(res1.data, null);

      const res2 = await testUser1
        .client!.from("decks")
        .select()
        .eq("id", tmpDeckId)
        .single();
      assertEquals(res2.error, null);
      assertNotEquals(res2.data, null);
      assertEquals(res2.data.name, "testuser1 deck2 updated");
    });

    await t.step("should not delete deck of other user", async () => {
      const res1 = await testUser2
        .client!.from("decks")
        .delete()
        .eq("id", tmpDeckId);
      assertEquals(res1.error, null);
      assertEquals(res1.data, null);

      const res2 = await testUser1
        .client!.from("decks")
        .select()
        .eq("id", tmpDeckId)
        .single();
      assertEquals(res2.error, null);
      assertNotEquals(res2.data, null);
      assertEquals(res2.data.name, "testuser1 deck2 updated");
    });

    await t.step("should delete deck", async () => {
      const res1 = await testUser1
        .client!.from("decks")
        .delete()
        .eq("id", tmpDeckId);
      assertEquals(res1.error, null);
      assertEquals(res1.data, null);

      const res2 = await testUser1
        .client!.from("decks")
        .select()
        .eq("id", tmpDeckId)
        .single();
      assertNotEquals(res2.error, null);
    });
  });

  await t.step(
    "should select / create / update / delete columns",
    async (t) => {
      let tmpColumnId = "";

      await t.step("should create columns", async () => {
        const res1 = await testUser1
          .client!.from("columns")
          .insert({
            name: "testuser1 column1",
            position: 0,
            userId: testUser1.id,
            deckId: testUser1.deckId,
          })
          .select()
          .single();
        assertEquals(res1.error, null);
        assertNotEquals(res1.data, null);
        testUser1.columnId = res1.data.id;

        const res2 = await testUser1
          .client!.from("columns")
          .insert({
            name: "testuser1 column2",
            position: 0,
            userId: testUser1.id,
            deckId: testUser1.deckId,
          })
          .select()
          .single();
        assertEquals(res2.error, null);
        assertNotEquals(res2.data, null);
        tmpColumnId = res2.data.id;
      });

      await t.step("should not create column for other user", async () => {
        const res1 = await testUser2
          .client!.from("columns")
          .insert({
            name: "testuser1 column1 by testuser2",
            postion: 0,
            userId: testUser1.id,
            deckId: testUser1.deckId,
          })
          .select()
          .single();
        assertNotEquals(res1.error, null);
      });

      await t.step("should select column", async () => {
        const res1 = await testUser1
          .client!.from("columns")
          .select()
          .eq("id", tmpColumnId)
          .single();
        assertEquals(res1.error, null);
        assertNotEquals(res1.data, null);
        assertEquals(res1.data.name, "testuser1 column2");
      });

      await t.step("should not select column of other user", async () => {
        const res1 = await testUser2
          .client!.from("columns")
          .select()
          .eq("id", tmpColumnId)
          .single();
        assertNotEquals(res1.error, null);
      });

      await t.step("should update column", async () => {
        const res1 = await testUser1
          .client!.from("columns")
          .update({ name: "testuser1 column2 updated" })
          .eq("id", tmpColumnId);
        assertEquals(res1.error, null);
        assertEquals(res1.data, null);

        const res2 = await testUser1
          .client!.from("columns")
          .select()
          .eq("id", tmpColumnId)
          .single();
        assertEquals(res2.error, null);
        assertNotEquals(res2.data, null);
        assertEquals(res2.data.name, "testuser1 column2 updated");
      });

      await t.step("should not update column of other user", async () => {
        const res1 = await testUser2
          .client!.from("columns")
          .update({ name: "testuser1 column2 updated by testuser2" })
          .eq("id", tmpColumnId);
        assertEquals(res1.error, null);
        assertEquals(res1.data, null);

        const res2 = await testUser1
          .client!.from("columns")
          .select()
          .eq("id", tmpColumnId)
          .single();
        assertEquals(res2.error, null);
        assertNotEquals(res2.data, null);
        assertEquals(res2.data.name, "testuser1 column2 updated");
      });

      await t.step("should not delete column of other user", async () => {
        const res1 = await testUser2
          .client!.from("columns")
          .delete()
          .eq("id", tmpColumnId);
        assertEquals(res1.error, null);
        assertEquals(res1.data, null);

        const res2 = await testUser1
          .client!.from("columns")
          .select()
          .eq("id", tmpColumnId)
          .single();
        assertEquals(res2.error, null);
        assertNotEquals(res2.data, null);
        assertEquals(res2.data.name, "testuser1 column2 updated");
      });

      await t.step("should delete column", async () => {
        const res1 = await testUser1
          .client!.from("columns")
          .delete()
          .eq("id", tmpColumnId);
        assertEquals(res1.error, null);
        assertEquals(res1.data, null);

        const res2 = await testUser1
          .client!.from("columns")
          .select()
          .eq("id", tmpColumnId)
          .single();
        assertNotEquals(res2.error, null);
      });
    },
  );

  await t.step(
    "should select / create / update / delete sources and items",
    async (t) => {
      const sourceId = `rss-${testUser1.id}-${testUser1.columnId}-a08a0344cbce92eb2655d0a3f14e883c`;
      const sourceIcon = `${testUser1.id}/rss-${testUser1.id}-${testUser1.columnId}-a08a0344cbce92eb2655d0a3f14e883c.png`;
      const itemId = `rss-${testUser1.id}-${testUser1.columnId}-a08a0344cbce92eb2655d0a3f14e883c-38751244b5b754e61b9114cce1a1a091`;

      await t.step("should not be able to create sources", async () => {
        const res1 = await testUser1
          .client!.from("sources")
          .insert({
            id: `rss-${testUser1.id}-${testUser1.columnId}-5581d70708fcfd1ae5039550429aa675`,
            columnId: testUser1.columnId,
            userId: testUser1.id,
            type: "rss",
            title: "FeedDeck",
            options: { rss: "https://feeddeck.app/testdata/feed.xml" },
            link: "https://feeddeck.app/",
            icon: `${testUser1.id}/rss-${testUser1.id}-${testUser1.columnId}-5581d70708fcfd1ae5039550429aa675.png`,
          })
          .select()
          .single();
        assertNotEquals(res1.error, null);
      });

      await t.step("should not be able to create items", async () => {
        const res1 = await testUser1
          .client!.from("items")
          .insert({
            id: `rss-${testUser1.id}-${testUser1.columnId}-5581d70708fcfd1ae5039550429aa675-`,
            userId: testUser1.id,
            columnId: testUser1.columnId,
            sourceId: `rss-${testUser1.id}-${testUser1.columnId}-5581d70708fcfd1ae5039550429aa675`,
            title: "Test Data",
            link: "https://feeddeck.app/testdata/feed.xml",
            media: "https://feeddeck.app/testdata/image.jpg",
            description:
              '<p><img src="https://feeddeck.app/testdata/image.jpg" /><br/><br/>Test Data for the FeedDeck E2E Tests with an Image and <b>HTML Formatted Content</b>.</p>',
            publishedAt: 1746187200,
          })
          .select()
          .single();
        assertNotEquals(res1.error, null);
      });

      await t.step("should create source and items via function", async () => {
        const res1 = await testUser1.client!.functions.invoke(
          "add-or-update-source-v1",
          {
            body: {
              source: {
                id: "",
                columnId: testUser1.columnId,
                userId: "",
                type: "rss",
                title: "",
                options: {
                  rss: "https://feeddeck.app/testdata/feed.xml",
                },
              },
            },
          },
        );
        assertEquals(res1.error, null);
        assertEquals(res1.data, {
          columnId: testUser1.columnId,
          icon: sourceIcon,
          id: sourceId,
          link: "https://feeddeck.app/",
          options: {
            rss: "https://feeddeck.app/testdata/feed.xml",
          },
          title: "FeedDeck",
          type: "rss",
          userId: testUser1.id,
        });
      });

      await t.step("should select source", async () => {
        const res1 = await testUser1
          .client!.from("sources")
          .select()
          .eq("id", sourceId)
          .single();
        assertEquals(res1.error, null);
        assertEqualsSource(res1.data, {
          columnId: testUser1.columnId,
          icon: sourceIcon,
          id: sourceId,
          link: "https://feeddeck.app/",
          options: {
            rss: "https://feeddeck.app/testdata/feed.xml",
          },
          title: "FeedDeck",
          type: "rss",
          userId: testUser1.id,
        });
      });

      await t.step(
        "should not be able to select source of other user",
        async () => {
          const res1 = await testUser2
            .client!.from("sources")
            .select()
            .eq("id", sourceId)
            .single();
          assertNotEquals(res1.error, null);
        },
      );

      await t.step("should select item", async () => {
        const res1 = await testUser1
          .client!.from("items")
          .select()
          .eq("id", itemId)
          .single();
        assertEquals(res1.error, null);
        assertEqualsItems(
          [res1.data],
          [
            {
              id: itemId,
              columnId: testUser1.columnId,
              userId: testUser1.id,
              sourceId: sourceId,
              title: "Test Data",
              link: "https://feeddeck.app/testdata/feed.xml",
              media: "https://feeddeck.app/testdata/image.jpg",
              description:
                '<p><img src="https://feeddeck.app/testdata/image.jpg" /><br/><br/>Test Data for the FeedDeck E2E Tests with an Image and <b>HTML Formatted Content</b>.</p>',
              author: null,
              options: null,
              publishedAt: 1746187200,
            },
          ],
        );
        assertEquals(res1.data.publishedAt, 1746187200);
      });

      await t.step(
        "should not be able to select item of other user",
        async () => {
          const res1 = await testUser2
            .client!.from("items")
            .select()
            .eq("id", itemId)
            .single();
          assertNotEquals(res1.error, null);
        },
      );

      await t.step("should get source icon from bucket", async () => {
        const res1 = await testUser2
          .client!.storage.from("sources")
          .download(sourceIcon);
        assertEquals(res1.error, null);
        assertNotEquals(res1.data, null);

        const res2 = await supabaseAdmin.storage
          .from("sources")
          .list(testUser1.id);
        assertEquals(res2.error, null);
        assertEquals(res2.data!.length, 1);
      });

      await t.step("should update source", async () => {
        const res1 = await testUser1
          .client!.from("sources")
          .update({ position: 1 })
          .eq("id", sourceId);
        assertEquals(res1.error, null);

        const res2 = await testUser1
          .client!.from("sources")
          .select()
          .eq("id", sourceId)
          .single();
        assertEquals(res2.error, null);
        assertEquals(res2.data.position, 1);
      });

      await t.step(
        "should not be able to update source of other user",
        async () => {
          const res1 = await testUser2
            .client!.from("sources")
            .update({ position: 2 })
            .eq("id", sourceId);
          assertEquals(res1.error, null);

          const res2 = await testUser1
            .client!.from("sources")
            .select()
            .eq("id", sourceId)
            .single();
          assertEquals(res2.error, null);
          assertEquals(res2.data.position, 1);
        },
      );

      await t.step("should update item", async () => {
        const res1 = await testUser1
          .client!.from("items")
          .update({ isRead: true, isBookmarked: false })
          .eq("id", itemId);
        assertEquals(res1.error, null);

        const res2 = await testUser1
          .client!.from("items")
          .select()
          .eq("id", itemId)
          .single();
        assertEquals(res2.error, null);
        assertEquals(res2.data.isRead, true);
        assertEquals(res2.data.isBookmarked, false);
      });

      await t.step(
        "should not be able to update item of other user",
        async () => {
          const res1 = await testUser2
            .client!.from("items")
            .update({ isRead: true, isBookmarked: true })
            .eq("id", itemId);
          assertEquals(res1.error, null);

          const res2 = await testUser1
            .client!.from("items")
            .select()
            .eq("id", itemId)
            .single();
          assertEquals(res2.error, null);
          assertEquals(res2.data.isRead, true);
          assertEquals(res2.data.isBookmarked, false);
        },
      );

      await t.step(
        "should not be able to delete item of other user",
        async () => {
          const res1 = await testUser2
            .client!.from("items")
            .delete()
            .eq("id", itemId);
          assertEquals(res1.error, null);

          const res2 = await testUser1
            .client!.from("items")
            .select()
            .eq("id", itemId)
            .single();
          assertEquals(res2.error, null);
          assertEquals(res2.data.isRead, true);
          assertEquals(res2.data.isBookmarked, false);
        },
      );

      await t.step("should delete item", async () => {
        const res1 = await testUser1
          .client!.from("items")
          .delete()
          .eq("id", itemId);
        assertEquals(res1.error, null);

        const res2 = await testUser1
          .client!.from("items")
          .select()
          .eq("id", itemId)
          .single();
        assertNotEquals(res2.error, null);
      });

      await t.step(
        "should not be able to delete source of other user",
        async () => {
          const res1 = await testUser2
            .client!.from("sources")
            .delete()
            .eq("id", sourceId);
          assertEquals(res1.error, null);

          const res2 = await testUser1
            .client!.from("sources")
            .select()
            .eq("id", sourceId)
            .single();
          assertEquals(res2.error, null);
          assertEquals(res2.data.position, 1);
        },
      );

      await t.step("should delete source", async () => {
        const res1 = await testUser1
          .client!.from("sources")
          .delete()
          .eq("id", sourceId);
        assertEquals(res1.error, null);

        const res2 = await testUser1
          .client!.from("sources")
          .select()
          .eq("id", sourceId)
          .single();
        assertNotEquals(res2.error, null);
      });

      await t.step(
        "should have deleted source icon from bucket when source was deleted",
        async () => {
          await sleep(3000);
          const res1 = await supabaseAdmin.storage
            .from("sources")
            .list(testUser1.id);
          assertEquals(res1.error, null);
          assertEquals(res1.data!.length, 0);
        },
      );
    },
  );

  await t.step("should not be able to call database functions", async () => {
    const res1 = await testUser1.client!.rpc("items_delete");
    assertNotEquals(res1.error, null);

    const res2 = await testUser1.client!.rpc("sources_delete_files");
    assertNotEquals(res2.error, null);
  });

  await t.step("should delete users", async () => {
    const res1 = await supabaseAdmin.auth.admin.deleteUser(testUser1.id);
    assertEquals(res1.error, null);
    const res2 = await supabaseAdmin.auth.admin.deleteUser(testUser2.id);
    assertEquals(res2.error, null);
  });
});
