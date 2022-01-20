import { config, list } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';
import { checkbox, integer, password, relationship, select, text, timestamp } from '@keystone-6/core/fields';
import { Lists } from '.keystone/types';

const session = statelessSessions({
  secret: ".MR-gkEFp'Hl0a]s4y7TJZ@:K?3x9u@CFC_+<^ldjpVL5:Fyi_2UB!)b*r3"
})

const Post: Lists.Post = list({
  fields: {
    title: text({ validation: { isRequired: true } }),
    slug: text({ isIndexed: 'unique', isFilterable: true }),
    content: text(),
  },
});

const User = list({
  fields: {
    name: text(),
    username: text({ validation: { isRequired: true } }),
    email: text({ isIndexed: 'unique', validation: { isRequired: true } }),
    password: password({ validation: { isRequired: true } }),
    accountCreated: timestamp({ defaultValue: { kind: 'now' } }),
    isOver18: checkbox(),
    pronouns: text(),
    eventsAttended: text(),
    isRunner: checkbox(),
    isStaff: checkbox(),
    discord: text({
      validation: {
        isRequired: true,
        match: {
          regex: /^.{3,32}#[0-9]{4}$/,
          explanation: `Discord user ID is invalid. Make sure its like "Clubwho#1337".`
        }
      }
    }),
    twitter: text({
      validation: {
        isRequired: true,
        match: {
          regex: /^@(\w){1,15}$/,
          explanation: `Twitter handle is invalid. Make sure its like "@Clubwhom".`
        }
      }
    })
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

const filterStaff = ({ session }: { session: any }) => {
  if (session?.data.isStaff) return true;
  return false;
};

// Would name this "Staff" but it gets marked as an ambiguous plural :(
const Volunteer = list({
  access: {
    filter: {
      query: filterStaff
    }
  },
  fields: {
    user: relationship({ ref: 'User' }),
    isHost: checkbox(),
    isTech: checkbox(),
    isRunnerManagement: checkbox(),
    isAdmin: checkbox(),
  },
  ui: {
    labelField: 'user'
  }
});

const Submission = list({
  access: {
    filter: {
      query: filterStaff
    }
  },
  fields: {
    user: relationship({ ref: 'User', ui: { hideCreate: true, labelField: 'username' } }),
    created: timestamp({ defaultValue: { kind: 'now' } }),
    game: text({ validation: { isRequired: true } }),
    category: text({ validation: { isRequired: true } }),
    platform: text({ validation: { isRequired: true } }),
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
        { label: "Yes - Only Race", value: "only" }
      ],
      defaultValue: "no"
    }),
    racer: text(),
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
    event: text({ validation: { isRequired: true }, defaultValue: 'ASM2022' }),
  },
  ui: {
    labelField: 'game'
  }
});

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'name isStaff',
  initFirstItem: {
    // These fields are collected in the "Create First User" form
    fields: ['name', 'email', 'password'],
  },
});

export default withAuth(
  config({
    db: { provider: 'sqlite', url: 'file:./app.db' },
    experimental: {
      generateNextGraphqlAPI: true,
      generateNodeAPI: true,
    },
    lists: { Post, User, Volunteer, Submission },
    session,
  })
);
