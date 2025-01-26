import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { generalMetadata, generalViewport } from "@/helpers/metadata";
import GetStartedEntry from "@/components/getstartedentry";

export const metadata: Metadata = {
  ...generalMetadata,
  title: "FeedDeck - Support",
};

export const viewport: Viewport = generalViewport;

export default function Support() {
  return (
    <main>
      <div className="container p-8 mx-auto">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-4xl font-bold">Get Started - Desktop</h1>
          <Link href="/get-started/mobile">Go to mobile version</Link>

          <GetStartedEntry
            title="Sign In / Sign Up"
            images={[
              "/get-started/desktop/1-1.webp",
              "/get-started/desktop/1-2.webp",
              "/get-started/desktop/1-3.webp",
            ]}
          >
            <p className="pt-4">
              You can sign in to FeedDeck with your{" "}
              <span className="font-bold">Apple</span> account,{" "}
              <span className="font-bold">Google</span> account or with an{" "}
              <span className="font-bold">email address and password</span>.
            </p>
            <p className="pt-4">
              To sign in with an email address and password select{" "}
              <span className="font-bold">
                &quot;Sign in with FeedDeck&quot;
              </span>{" "}
              on the start parge. If you do not have an account yet, you can
              create one by clicking on{" "}
              <span className="font-bold">Sign Up</span> on the sign in page.
            </p>
            <p className="pt-4">
              If you sign up using your email address and password we send you
              an verification email to confirm your email address. Once the
              verification is done you are able to sign in using the provided
              email address and password.
            </p>
          </GetStartedEntry>

          <GetStartedEntry
            title="Add a Column"
            images={[
              "/get-started/desktop/2-1.webp",
              "/get-started/desktop/2-2.webp",
            ]}
          >
            <p className="pt-4">
              To add a new column click on the{" "}
              <span className="font-bold">plus icon</span>{" "}
              (<span className="font-bold inline-flex items-baseline">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                >
                  <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                </svg>
              </span>) on the right side in the bottom bar.
            </p>
            <p className="pt-4">
              After you clicked on the plus icon a dialog will open. In this
              dialog you have to provide the name of the column and click on the
              {" "}
              <span className="font-bold">&quot;Create Column&quot;</span>{" "}
              button to create the column.
            </p>
          </GetStartedEntry>

          <GetStartedEntry
            title="Manage Columns"
            images={[
              "/get-started/desktop/3-1.webp",
            ]}
          >
            <p className="pt-4">
              To adjust the name or position of a column or to delete a column
              click on the <span className="font-bold">settings icon</span>{" "}
              (<span className="font-bold inline-flex items-baseline">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                >
                  <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
                </svg>
              </span>) on the right side next to the column name.
            </p>
            <p className="pt-4">
              Adjust the name of the column in the input field and click on the
              {" "}
              <span className="font-bold">save icon</span>{" "}
              (<span className="font-bold inline-flex items-baseline">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                >
                  <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z" />
                </svg>
              </span>) to change the name of the column.
            </p>
            <p className="pt-4">
              To adjust the position of a column use the arrow keys on the left
              and right side on the bottom of the column settings.
            </p>
            <p className="pt-4">
              To delete a column click on the{" "}
              <span className="font-bold">trash icon</span>{" "}
              (<span className="font-bold inline-flex items-baseline">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                >
                  <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                </svg>
              </span>) in the middle on the bottom of the column settings.
            </p>
          </GetStartedEntry>

          <GetStartedEntry
            title="Add a Source"
            images={[
              "/get-started/desktop/4-1.webp",
              "/get-started/desktop/4-2.webp",
              "/get-started/desktop/4-3.webp",
            ]}
          >
            <p className="pt-4">
              To add a new source click on the{" "}
              <span className="font-bold">settings icon</span>{" "}
              (<span className="font-bold inline-flex items-baseline">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                >
                  <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
                </svg>
              </span>) on the right side next to the column name. When the
              settings menu is opened click on the{" "}
              <span className="font-bold">&quot;Add Source&quot;</span>{" "}
              button to add a new source to the column.
            </p>
            <p className="pt-4">
              Select the type of the source you want to add, e.g. RSS, Podcast,
              YouTube or Mastodon and provide the required data in the next
              step. Once you have provided all the required data click on the
              {" "}
              <span className="font-bold">&quot;Add Source&quot;</span>{" "}
              button to add the source to the column. In the following you find
              some examples for some of the sources:
            </p>
            <div className="pl-8 pt-4 break-all">
              <ul className="list-disc">
                <li>
                  <span className="font-bold">RSS:</span>{" "}
                  https://www.tagesschau.de/xml/rss2/
                </li>
                <li>
                  <span className="font-bold">Podcast:</span>{" "}
                  https://kubernetespodcast.com/feeds/audio.xml
                </li>
                <li>
                  <span className="font-bold">Podcast:</span>{" "}
                  https://www.youtube.com/user/tagesschau
                </li>
                <li>
                  <span className="font-bold">Mastodon:</span>{" "}
                  @ricoberger@hachyderm.io
                </li>
              </ul>
            </div>
          </GetStartedEntry>

          <GetStartedEntry
            title="Manage Sources"
            images={[
              "/get-started/desktop/5-1.webp",
            ]}
          >
            <p className="pt-4">
              To manage the sources for a column click on the{" "}
              <span className="font-bold">settings icon</span>{" "}
              (<span className="font-bold inline-flex items-baseline">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                >
                  <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
                </svg>
              </span>) on the right side next to the column name.
            </p>
            <p className="pt-4">
              You can delete a source by clicking on the{" "}
              <span className="font-bold">trash icon</span>{" "}
              (<span className="font-bold inline-flex items-baseline">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                >
                  <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                </svg>
              </span>) on the right side of the source name.
            </p>
          </GetStartedEntry>

          <GetStartedEntry
            title="Filter Items"
            images={[
              "/get-started/desktop/6-1.webp",
            ]}
          >
            <p className="pt-4">
              You can filter items by searching for the title and content of an
              item or by filtering by read, unread or bookmarked items. You can
              only show items related to a single source.
            </p>
            <p className="pt-4">
              To search for an item with a specifc title or content provide your
              search term in the search input field and press{" "}
              <span className="font-bold">Enter</span>.
            </p>
            <p className="pt-4">
              To only show read, unread or bookmarked items, click on the{" "}
              <span className="font-bold">filter icon</span>{" "}
              (<span className="font-bold inline-flex items-baseline">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                >
                  <path d="M400-240v-80h160v80H400ZM240-440v-80h480v80H240ZM120-640v-80h720v80H120Z" />
                </svg>
              </span>) next to the search input field and select the
              corresponding option.
            </p>
            <p className="pt-4">
              To only show items related to a single source select the source
              below the search input field. To show all items click again on the
              selected source.
            </p>
          </GetStartedEntry>

          <GetStartedEntry
            title="Mark Items as Read and Bookmark Items"
            images={[
              "/get-started/desktop/7-1.webp",
              "/get-started/desktop/7-2.webp",
            ]}
          >
            <p className="pt-4">
              To mark an item as{" "}
              <span className="font-bold">read / unread</span>{" "}
              click a bit longer on the item and select{" "}
              <span className="font-bold">&quot;Mark as Read&quot;</span> /{" "}
              <span className="font-bold">&quot;Mark as Unread&quot;</span>{" "}
              from the menu.
            </p>
            <p className="pt-4">
              To bookmark an item click a bit longer on the item and select{" "}
              <span className="font-bold">&quot;Add Bookmark&quot;</span>{" "}
              from the menu.
            </p>
            <p className="pt-4">
              When you click on an item the details view for the selected item
              is opened and the item will be marked as read automatically. You
              can then use the icons in the top right corner in the{" "}
              <span className="font-bold">details view</span>{" "}
              to mark an items as read / unread or to add it to your bookmarks.
            </p>
          </GetStartedEntry>

          <GetStartedEntry
            title="Manage Decks"
            images={[
              "/get-started/desktop/8-1.webp",
              "/get-started/desktop/8-2.webp",
            ]}
          >
            <p className="pt-4">
              To manage your decks click on the{" "}
              <span className="font-bold">settings icon</span>{" "}
              (<span className="font-bold inline-flex items-baseline">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                >
                  <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
                </svg>
              </span>) on the right side in the bottom bar. This will open the
              settings menu where you can select the deck you want to view and
              where you can manage your decks.
            </p>
            <p className="pt-4">
              To add, edit or delete decks click on the{" "}
              <span className="font-bold">edit icon</span>{" "}
              (<span className="font-bold inline-flex items-baseline">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                >
                  <path d="M200-200h56l345-345-56-56-345 345v56Zm572-403L602-771l56-56q23-23 56.5-23t56.5 23l56 56q23 23 24 55.5T829-660l-57 57Zm-58 59L290-120H120v-170l424-424 170 170Zm-141-29-28-28 56 56-28-28Z" />
                </svg>
              </span>) on the right side of the decks section.
            </p>
            <p className="pt-4">
              To add a new deck use the last input field in the decks section.
              After you have provided a name click on the{" "}
              <span className="font-bold">plus icon</span>{" "}
              (<span className="font-bold inline-flex items-baseline">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                >
                  <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                </svg>
              </span>) to add a new deck.
            </p>
            <p className="pt-4">
              To adjust the name of a deck use the corresponding input field and
              click the <span className="font-bold">save icon</span>{" "}
              (<span className="font-bold inline-flex items-baseline">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                >
                  <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z" />
                </svg>
              </span>) to save the changes.
            </p>
            <p className="pt-4">
              To delete a deck click on the{" "}
              <span className="font-bold">trash icon</span>{" "}
              (<span className="font-bold inline-flex items-baseline">
                <svg
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                >
                  <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                </svg>
              </span>) next to the deck name.
            </p>
          </GetStartedEntry>
        </div>
      </div>
    </main>
  );
}
