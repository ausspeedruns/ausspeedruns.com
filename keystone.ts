import { config, list } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';
import { document } from '@keystone-6/fields-document'
import { checkbox, float, password, relationship, select, text, timestamp } from '@keystone-6/core/fields';
import { Lists } from '.keystone/types';

const session = statelessSessions({
  secret: ".MR-gkEFp'Hl0a]s4y7TJZ@:K?3x9u@CFC_+<^ldjpVL5:Fyi_2UB!)b*r3"
})

const operationsAdmin = ({ session }: { session: any }) => session?.data.roleAdmin;

const filterPosts = ({ session }: { session: any }) => {
  // if the user is an Admin, they can access all the records
  if (session?.data.roleAdmin) return true;
  // otherwise, filter for published posts
  // return { published: { equals: true } };
  return false;
}

const Post: Lists.Post = list({
  access: {
    operation: {
      create: operationsAdmin,
      delete: operationsAdmin,
      update: operationsAdmin,
    },
    filter: {
      query: filterPosts
    }
  },
  fields: {
    title: text({ validation: { isRequired: true } }),
    slug: text({ isIndexed: 'unique', isFilterable: true }),
    author: relationship({ ref: 'User', many: true }),
    published: checkbox(),
    role: select({
      type: 'enum',
      options: [
        { label: "Public", value: "public" },
        { label: "Runners", value: "runner" },
        { label: "Tech", value: "tech" },
        { label: "Runner Management", value: "runnermanagement" }
      ]
    }),
    content: document({
      formatting: true,
      links: true,
      layouts: [
        [1, 1],
        [1, 1, 1],
        [2, 1],
        [1, 2],
        [1, 2, 1]
      ],
      dividers: true
    }),
  },
});

const User = list({
  access: {
    filter: {
      query: () => true
    }
  },
  fields: {
    name: text(),
    username: text({ validation: { isRequired: true } }),
    email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
    password: password({ validation: { isRequired: true } }),
    accountCreated: timestamp({ defaultValue: { kind: 'now' } }),
    isOver18: checkbox(),
    pronouns: text(),
    eventsAttended: text(),
    discord: text({
      validation: {
        isRequired: false,
        match: {
          regex: /(^.{3,32}#[0-9]{4}$)?/,
          explanation: `Discord user ID is invalid. Make sure its like "Clubwho#1337".`
        }
      }
    }),
    twitter: text({
      validation: {
        isRequired: false,
        match: {
          regex: /(^@(\w){1,15}$)?/,
          explanation: `Twitter handle is invalid. Make sure its like "@Clubwhom".`
        }
      }
    }),
    submissions: relationship({ ref: 'Submission.user', many: true }),

    // I really don't like all these checkboxes
    roleRunner: checkbox(),
    roleTech: checkbox(),
    roleRunnerManagement: checkbox(),
    roleAdmin: checkbox(),
  },
  ui: {
    labelField: 'username'
  }
});

// Sessions type does not exist apprently, which goes against what the guide states...
// const isStaff = ({ session }: { session: any }) => session?.data.isStaff;
// const isAdmin = ({ session }: { session: any }) => {
//   session?.data.
// }

const filterAdmin = ({ session }: { session: any }) => {
  if (session?.data.roleAdmin) return true;
  return false;
};

const Submission = list({
  access: {
    filter: {
      query: filterAdmin,
    }
  },
  fields: {
    user: relationship({ ref: 'User.submissions', ui: { hideCreate: true, labelField: 'username' } }),
    created: timestamp({ defaultValue: { kind: 'now' } }),
    game: text({ validation: { isRequired: true } }),
    category: text({ validation: { isRequired: true } }),
    platform: text({ validation: { isRequired: true } }), // Potentially an enum with "other"?
    estimate: text({ validation: { isRequired: true, match: { regex: /^\d{2}:\d{2}:\d{2}$/, explanation: 'Estimate invalid. Make sure its like 01:30:00.' } } }),
    ageRating: select({
      type: 'enum',
      options: [
        { label: "M or Lower", value: "m_or_lower" },
        { label: "MA15+", value: "ma15" },
        { label: "RA18+", value: "ra18" }
      ],
      defaultValue: "M_or_Lower"
    }),
    donationIncentive: text(),
    race: select({
      type: 'enum',
      options: [
        { label: "No", value: "no" },
        { label: "Yes - Possible Solo", value: "solo" },
        { label: "Yes - Only Race/Coop", value: "only" }
      ],
      defaultValue: "no"
    }),
    racer: text(),
    coop: checkbox(),
    video: text({ validation: { isRequired: true } }),
    status: select({
      type: 'enum',
      options: [
        { label: "Submitted", value: "submitted" },
        { label: "Accepted", value: "accepted" },
        { label: "Backup", value: "backup" }
      ],
      defaultValue: "submitted"
    }),
    event: relationship({ ref: 'Event.submissions', ui: { hideCreate: true, labelField: 'shortname' } }),
  },
  ui: {
    labelField: 'game'
  }
});

const Event = list({
  access: {
    operation: {
      create: filterAdmin,
      delete: filterAdmin,
      update: filterAdmin,
    },
    filter: {
    }
  },
  fields: {
    name: text(),
    shortname: text(),
    raised: float(),
    submissions: relationship({ ref: 'Submission.event', many: true, access: filterAdmin }),
    acceptingSubmissions: checkbox(),
  }
});

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'name roleAdmin',
  initFirstItem: {
    // These fields are collected in the "Create First User" form
    fields: ['name', 'email', 'password', 'username'],
  },
});

export default withAuth(
  config({
    db: { provider: 'sqlite', url: 'file:./app.db' },
    experimental: {
      generateNextGraphqlAPI: true,
      generateNodeAPI: true,
    },
    lists: { Post, User, Submission, Event },
    session,
    ui: {
      isAccessAllowed: context => context.session?.data.roleAdmin,
    }
  })
);
