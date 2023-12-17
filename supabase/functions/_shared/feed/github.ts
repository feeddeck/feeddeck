import { SupabaseClient } from '@supabase/supabase-js';
import { Redis } from 'redis';

import { ISource } from '../models/source.ts';
import { IItem } from '../models/item.ts';
import { IProfile } from '../models/profile.ts';
import { utils } from '../utils/index.ts';
import { feedutils } from './utils/index.ts';

export const getGithubFeed = async (
  supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  if (!source.options?.github || !source.options?.github.type) {
    throw new feedutils.FeedValidationError('Invalid source options');
  }

  if (!profile.accountGithub?.token) {
    throw new Error('GitHub token is missing');
  }
  const token = await utils.decrypt(profile.accountGithub.token);

  if (
    source.options.github.type === 'notifications' ||
    source.options.github.type === 'repositorynotifications'
  ) {
    /**
     * With `notifications` and `repositorynotifications` type users can add
     * there GitHub notifications or repository notifications as source to
     * FeedDeck. The notifications are retrieved from the GitHub API via the
     * list notifications endpoint.
     *
     * - https://docs.github.com/en/rest/activity/notifications?apiVersion=2022-11-28#list-notifications-for-the-authenticated-user
     * - https://docs.github.com/en/rest/activity/notifications?apiVersion=2022-11-28#list-repository-notifications-for-the-authenticated-user
     * - https://docs.github.com/en/rest/activity/notifications?apiVersion=2022-11-28#about-notification-reasons
     */
    const notifications = [];

    if (source.options.github.type === 'notifications') {
      const tmpNotifications = await request('/notifications', {
        token: token,
        params: {
          all: 'true',
          participating: source.options.github.participating ? 'true' : 'false',
          page: '1',
          per_page: '50',
        },
      });

      const user = await request('/user', {
        token: token,
      });

      source.id =
        `github-${source.userId}-${source.columnId}-${source.options.github.type}-${source.options.github.participating}`;
      source.title = user.login;
      source.icon = user.avatar_url;
      source.icon = await feedutils.uploadSourceIcon(supabaseClient, source);
      notifications.push(...tmpNotifications);
    } else if (
      source.options.github.type === 'repositorynotifications' &&
      source.options.github.repository
    ) {
      const [owner, repo] = source.options.github.repository.split('/');
      const tmpNotifications = await request(
        `/repos/${owner}/${repo}/notifications`,
        {
          token: token,
          params: {
            all: 'true',
            participating: source.options.github.participating
              ? 'true'
              : 'false',
            page: '1',
            per_page: '50',
          },
        },
      );

      source.id =
        `github-${source.userId}-${source.columnId}-${source.options.github.type}--${source.options.github.participating}-${source.options.github.repository}`;
      source.title = `${owner}/${repo}`;
      if (
        tmpNotifications.length > 0 &&
        tmpNotifications[0].repository?.owner?.avatar_url
      ) {
        source.icon = tmpNotifications[0].repository.owner.avatar_url;
        source.icon = await feedutils.uploadSourceIcon(supabaseClient, source);
      } else {
        source.icon = `https://github.com/${owner}.png`;
        source.icon = await feedutils.uploadSourceIcon(supabaseClient, source);
      }
      notifications.push(...tmpNotifications);
    } else {
      throw new feedutils.FeedValidationError('Invalid source options');
    }

    source.type = 'github';
    source.link = 'https://github.com/notifications';

    const items: IItem[] = [];

    for (const [_, notification] of notifications.entries()) {
      items.push({
        id: `${source.id}-${notification.id}`,
        userId: source.userId,
        columnId: source.columnId,
        sourceId: source.id,
        title: notification.subject?.title ?? 'Notification',
        link: getLinkFromApiUrl(notification.subject?.url),
        media: notification.repository.owner.avatar_url,
        description: formatDescription(notification),
        author: notification.repository?.full_name,
        publishedAt: Math.floor(
          new Date(notification.updated_at).getTime() / 1000,
        ),
      });
    }

    return { source, items };
  } else if (
    source.options.github.type === 'useractivities' ||
    source.options.github.type === 'repositoryactivities' ||
    source.options.github.type === 'organizationactivitiespublic' ||
    source.options.github.type === 'organizationactivitiesprivate'
  ) {
    /**
     * `useractivities`, `repositoryactivities`, `organizationactivitiespublic`
     * and `organizationactivitiesprivate` lets a user add the user, repository
     * or organization notifications as source. We are using the corresponding
     * events endpoint to get the notifications and add the id, title, icon and
     * link to the source. Then we are going though all the events and adding
     * the actor of an event as author. The title, description and link is
     * different for each notification type and generated via the `formatEvent`
     * function.
     *
     * - https://docs.github.com/en/developers/webhooks-and-events/events/github-event-types
     * - GitHubTypeUserActivities: https://docs.github.com/en/rest/activity/events?apiVersion=2022-11-28#list-events-received-by-the-authenticated-user
     * - GitHubTypeRepositoryActivities: https://docs.github.com/en/rest/activity/events?apiVersion=2022-11-28#list-organization-events-for-the-authenticated-user
     * - GitHubTypeOrganizationActivitiesPublic: https://docs.github.com/en/rest/activity/events?apiVersion=2022-11-28#list-public-organization-events
     * - GitHubTypeOrganizationActivitiesPrivate: https://docs.github.com/en/rest/activity/events?apiVersion=2022-11-28#list-organization-events-for-the-authenticated-user
     */
    const events = [];

    if (
      source.options.github.type === 'useractivities' &&
      source.options.github.user
    ) {
      const tmpEvents = await request(
        `/users/${source.options.github.user}/received_events/public`,
        {
          token: token,
          params: {
            page: '1',
            per_page: '100',
          },
        },
      );

      const user = await request(`/users/${source.options.github.user}`, {
        token: token,
      });

      source.id =
        `github-${source.userId}-${source.columnId}-${source.options.github.type}-${source.options.github.user}`;
      source.title = source.options.github.user;
      source.icon = user.avatar_url;
      source.icon = await feedutils.uploadSourceIcon(supabaseClient, source);
      source.link = `https://github.com/${source.options.github.user}`;

      events.push(...tmpEvents);
    } else if (
      source.options.github.type === 'repositoryactivities' &&
      source.options.github.repository
    ) {
      const [owner, repo] = source.options.github.repository.split('/');
      const tmpEvents = await request(
        `/repos/${owner}/${repo}/events`,
        {
          token: token,
          params: {
            page: '1',
            per_page: '100',
          },
        },
      );

      const user = await request(`/users/${owner}`, {
        token: token,
      });

      source.id =
        `github-${source.userId}-${source.columnId}-${source.options.github.type}-${owner}-${repo}`;
      source.title = `${owner}/${repo}`;
      source.icon = user.avatar_url;
      source.icon = await feedutils.uploadSourceIcon(supabaseClient, source);
      source.link = `https://github.com/${owner}/${repo}`;

      events.push(...tmpEvents);
    } else if (
      source.options.github.type === 'organizationactivitiespublic' &&
      source.options.github.organization
    ) {
      const tmpEvents = await request(
        `/orgs/${source.options.github.organization}/events`,
        {
          token: token,
          params: {
            page: '1',
            per_page: '100',
          },
        },
      );

      const user = await request(
        `/users/${source.options.github.organization}`,
        {
          token: token,
        },
      );

      source.id =
        `github-${source.userId}-${source.columnId}-${source.options.github.type}-${source.options.github.organization}`;
      source.title = source.options.github.organization;
      source.icon = user.avatar_url;
      source.icon = await feedutils.uploadSourceIcon(supabaseClient, source);
      source.link = `https://github.com/${source.options.github.organization}`;

      events.push(...tmpEvents);
    } else if (
      source.options.github.type === 'organizationactivitiesprivate' &&
      source.options.github.organization
    ) {
      const user = await request('/user', {
        token: token,
      });

      const tmpEvents = await request(
        `/users/${user.login}/events/orgs/${source.options.github.organization}`,
        {
          token: token,
          params: {
            page: '1',
            per_page: '100',
          },
        },
      );

      const org = await request(
        `/users/${source.options.github.organization}`,
        {
          token: token,
        },
      );

      source.id =
        `github-${source.userId}-${source.columnId}-${source.options.github.type}-${source.options.github.organization}`;
      source.title = source.options.github.organization;
      source.icon = org.avatar_url;
      source.icon = await feedutils.uploadSourceIcon(supabaseClient, source);
      source.link = `https://github.com/${source.options.github.organization}`;

      events.push(...tmpEvents);
    } else {
      throw new feedutils.FeedValidationError('Invalid source options');
    }

    source.type = 'github';

    const items: IItem[] = [];

    for (const [_, event] of events.entries()) {
      const eventDetails = formatEvent(event);
      if (eventDetails) {
        items.push({
          id: `${source.id}-${event.id}`,
          userId: source.userId,
          columnId: source.columnId,
          sourceId: source.id,
          title: eventDetails.title ?? '',
          link: eventDetails.link ?? '',
          media: event.actor?.avatar_url
            ? event.actor?.avatar_url
            : event.actor?.login
            ? `https://github.com/${event.actor.login}.png`
            : undefined,
          description: eventDetails.description,
          author: event.actor?.login ? event.actor.login : undefined,
          publishedAt: Math.floor(
            new Date(event.created_at).getTime() / 1000,
          ),
        });
      }
    }

    return { source, items };
  } else if (
    source.options.github.type === 'searchissuesandpullrequests' &&
    source.options.github.query
  ) {
    /**
     * The `searchissuesandpullrequests` let a user add a seach query as source.
     * With this type it is possible to follow all issues and pull requests of
     * an user, repository or organization. Since we allow a custom query we do
     * not add a icon and link to the source. The id of the source is generated
     * based on a hash of the query. Then we are going through all the returned
     * issues and generating an item for each issue, where we are using the user
     * as author (we were also thinking about using the repository, but decided
     * against it).
     *
     * - https://docs.github.com/en/rest/search?apiVersion=2022-11-28#search-issues-and-pull-requests
     */
    const issues = await request(
      `/search/issues`,
      {
        token: token,
        params: {
          q: source.options.github.query,
          sort: 'created',
          direction: 'desc',
          page: '1',
          per_page: '100',
        },
      },
    );

    source.id =
      `github-${source.userId}-${source.columnId}-${source.options.github.type}-${await utils
        .md5(source.options.github.query)}`;
    source.type = 'github';
    source.title = source.options.github.queryName || 'Search';
    source.icon = undefined;
    source.link = undefined;

    const items: IItem[] = [];

    for (const [_, issue] of issues.items.entries()) {
      items.push({
        id: `${source.id}-${issue.node_id}`,
        userId: source.userId,
        columnId: source.columnId,
        sourceId: source.id,
        title: issue.title,
        link: issue.html_url,
        media: issue?.user?.avatar_url
          ? issue.user.avatar_url
          : issue?.user?.login
          ? `https://github.com/${issue.user.login}.png`
          : undefined,
        description: `${
          issue.repository_url.replace(
            'https://api.github.com/repos/',
            '',
          )
        } #${issue.number}`,
        author: issue.user.login,
        publishedAt: Math.floor(
          new Date(issue.created_at).getTime() / 1000,
        ),
      });
    }

    return { source, items };
  }

  throw new feedutils.FeedValidationError('Invalid source options');
};

/**
 * `request` is a helper function to make a request to the GitHub API.
 */
const request = async (
  url: string,
  options: { token: string; params?: Record<string, string> },
) => {
  const res = await utils.fetchWithTimeout(
    `https://api.github.com${url}${
      options.params ? `?${new URLSearchParams(options.params).toString()}` : ''
    }`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${options.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
    5000,
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.message ?? 'Unknown error');
  }

  return await res.json();
};

/**
 * `getLinkFromApiUrl` returns a link which can be clicked by a user based on
 * the given GitHub API url. If there is no url given we return the default
 * GitHub notifications link.
 */
const getLinkFromApiUrl = (url?: string): string => {
  if (!url) {
    return 'https://github.com/notifications';
  }

  if (/^https:\/\/api.github.com\/repos\/.*\/.*\/pulls\/\d+$/.test(url)) {
    const n = url.lastIndexOf('pulls');
    url = url.slice(0, n) + url.slice(n).replace('pulls', 'pull');
  }

  return `https://github.com/${
    url.replace('https://api.github.com/repos/', '')
  }`;
};

/**
 * `formatDescription` formats the description for a notification based on the
 * notification reason.
 * See: https://docs.github.com/en/rest/activity/notifications?apiVersion=2022-11-28#about-notification-reasons
 */
// deno-lint-ignore no-explicit-any
const formatDescription = (notification: any): string | undefined => {
  switch (notification.reason) {
    case 'assign':
      return 'You were assigned to the issue.';
    case 'author':
      return 'You created the thread.';
    case 'comment':
      return 'You commented on the thread.';
    case 'ci_activity':
      return 'A GitHub Actions workflow run that you triggered was completed.';
    case 'invitation':
      return 'You accepted an invitation to contribute to the repository.';
    case 'manual':
      return 'You subscribed to the thread (via an issue or pull request).';
    case 'mention':
      return 'You were specifically @mentioned in the content.';
    case 'review_requested':
      return 'You, or a team you\'re a member of, were requested to review a pull request.';
    case 'security_alert':
      return 'GitHub discovered a security vulnerability in your repository.';
    case 'state_change':
      return 'You changed the thread state (for example, closing an issue or merging a pull request).';
    case 'subscribed':
      return 'You\'re watching the repository.';
    case 'team_mention':
      return 'You were on a team that was mentioned.';
    default:
      return undefined;
  }
};

/**
 * `formatEvent` formats the given event by returning a proper title, link and
 * description for a item as we save it in our database. If the event type is
 * not supported or a required field is missing we return an error.
 */
const formatEvent = (
  // deno-lint-ignore no-explicit-any
  event: any,
): {
  title: string | undefined;
  link: string | undefined;
  description: string | undefined;
} | undefined => {
  switch (event.type) {
    case 'CommitCommentEvent':
      if (event.payload?.comment?.html_url) {
        return {
          title: '',
          link: event.payload.comment.html_url,
          description: 'Added a comment to a commit',
        };
      }
      return undefined;

    case 'CreateEvent':
      if (event.payload?.ref_type) {
        let description = '';
        switch (event.payload?.ref_type) {
          case 'repository':
            description = 'Created a new repository';
            break;
          case 'branch':
            description = 'Created a new branch';
            break;
          case 'tag':
            description = 'Created a new tag';
            break;
          default:
            description = 'Created something';
            break;
        }
        return {
          title: '',
          link: event.repo.html_url,
          description: description,
        };
      }
      return undefined;

    case 'DeleteEvent':
      if (event.payload?.ref_type) {
        let description = '';
        switch (event.payload?.ref_type) {
          case 'repository':
            description = 'Deleted a repository';
            break;
          case 'branch':
            description = 'Deleted a branch';
            break;
          case 'tag':
            description = 'Deleted a tag';
            break;
          default:
            description = 'Deleted something';
            break;
        }
        return {
          title: '',
          link: event.repo.html_url,
          description: description,
        };
      }
      return undefined;

    case 'ForkEvent':
      if (event.payload?.forkee) {
        return {
          title: event.payload.forkee.name,
          link: event.payload.forkee.html_url,
          description: 'Forked a repository',
        };
      }
      return undefined;

    case 'GollumEvent':
      if (event.payload?.pages && event.payload?.pages.length > 0) {
        let description = '';
        switch (event.payload?.pages[0].action) {
          case 'created':
            description = 'Created a new wiki page';
            break;
          default:
            description = 'Updated a wiki page';
            break;
        }
        return {
          title: event.payload.pages[0].title,
          link: event.payload.pages[0].html_url,
          description: description,
        };
      }
      return undefined;

    case 'IssueCommentEvent':
      if (event.payload?.issue && event.payload?.comment) {
        return {
          title: event.payload.issue.title,
          link: event.payload.comment.html_url,
          description: 'Added a comment',
        };
      }
      return undefined;

    case 'IssuesEvent':
      if (event.payload?.action && event.payload?.issue) {
        let description = '';
        switch (event.payload?.action) {
          case 'assigned':
            description = 'Assigned';
            break;
          case 'unassigned':
            description = 'Unassigned';
            break;
          case 'review_requested':
            description = 'Requested a review';
            break;
          case 'review_request_removed':
            description = 'Removed a requested review';
            break;
          case 'labeled':
            description = 'Added a label';
            break;
          case 'unlabeled':
            description = 'Removed a label';
            break;
          case 'opened':
            description = 'Opened an issue';
            if (event.payload.issue.pull_request) {
              description = 'Opened a pull request';
            }
            break;
          case 'closed':
            description = 'Closed an issue';
            if (event.payload.issue.pull_request) {
              description = 'Closed a pull request';
            }
            break;
          case 'reopened':
            description = 'Reopened an issue';
            if (event.payload.issue.pull_request) {
              description = 'Reopened a pull request';
            }
            break;
          case 'synchronize':
            description = 'Synchronized an issue';
            if (event.payload.issue.pull_request) {
              description = 'Synchronized a pull request';
            }
            break;
          case 'edited':
            description = 'Edited an issue';
            if (event.payload.issue.pull_request) {
              description = 'Edited a pull request';
            }
            break;
        }
        return {
          title: event.payload.issue.title,
          link: event.payload.issue.html_url,
          description: description,
        };
      }
      return undefined;

    case 'MemberEvent':
      if (event.payload?.action && event.payload?.member) {
        let description = '';
        switch (event.payload?.action) {
          case 'added':
            description = 'Was added as member';
            break;
        }
        return {
          title: event.payload.member.login,
          link: event.payload.member.html_url,
          description: description,
        };
      }
      return undefined;

    case 'PullRequestEvent':
      if (event.payload?.action && event.payload?.pull_request) {
        let description = '';
        switch (event.payload?.action) {
          case 'assigned':
            description = 'Assigned';
            break;
          case 'unassigned':
            description = 'Unassigned';
            break;
          case 'review_requested':
            description = 'Requested a review';
            break;
          case 'review_request_removed':
            description = 'Removed a requested review';
            break;
          case 'labeled':
            description = 'Added a label';
            break;
          case 'unlabeled':
            description = 'Removed a label';
            break;
          case 'opened':
            description = 'Opened';
            break;
          case 'closed':
            if (
              event.payload?.pull_request.merged &&
              event.payload?.pull_request.merged == true
            ) {
              description = 'Merged';
              break;
            } else {
              description = 'Closed';
              break;
            }
          case 'reopened':
            description = 'Reopened';
            break;
          case 'synchronize':
            description = 'Synchronized';
            break;
          case 'edited':
            description = 'Edited';
            break;
        }
        return {
          title: event.payload.pull_request.title,
          link: event.payload.pull_request.html_url,
          description: description,
        };
      }
      return undefined;

    case 'PullRequestReviewEvent':
      if (
        event.payload?.pull_request &&
        event.payload?.review
      ) {
        return {
          title: event.payload.pull_request.title,
          link: event.payload.review.html_url,
          description: 'Added a review',
        };
      }
      return undefined;

    case 'PullRequestReviewCommentEvent':
      if (
        event.payload?.action &&
        event.payload?.pull_request &&
        event.payload?.comment
      ) {
        let description = '';
        switch (event.payload?.action) {
          case 'created':
            description = 'Added a review comment';
            break;
          case 'edited':
            description = 'Updated a review comment';
            break;
          case 'deleted':
            description = 'Deleted a review comment';
            break;
        }
        return {
          title: event.payload.pull_request.title,
          link: event.payload.comment.html_url,
          description: description,
        };
      }
      return undefined;

    case 'PushEvent':
      if (event.payload?.repository) {
        return {
          title: '',
          link: event.payload.repository.html_url,
          description: event.payload.commits
            ? event.payload.commits.length === 1
              ? `Pushed ${event.payload.commits.length} commit`
              : `Pushed ${event.payload.commits.length} commits`
            : '',
        };
      }
      return undefined;

    case 'ReleaseEvent':
      if (event.payload?.action && event.payload?.release) {
        let description = '';
        switch (event.payload?.action) {
          case 'created':
            description = 'Release was created';
            break;
          case 'deleted':
            description = 'Release was created';
            break;
          case 'edited':
            description = 'Release was updated';
            break;
          case 'prereleased':
            description = 'Prerelease was created';
            break;
          case 'published':
            description = 'Release was published';
            break;
          case 'released':
            description = 'Release was released';
            break;
          case 'unpublished':
            description = 'Release was unpublished';
            break;
        }
        return {
          title: event.payload.release.name,
          link: event.payload.release.html_url,
          description: description,
        };
      }
      return undefined;

    case 'WatchEvent':
      if (event.actor) {
        return {
          title: '',
          link: `https://github.com/${event.actor.login}`,
          description: `${event.actor.login} starred ${
            event.payload?.repository?.name || 'the repository'
          }`,
        };
      }
      return undefined;

    default:
      return undefined;
  }
};
