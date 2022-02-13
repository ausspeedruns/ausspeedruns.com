import { config, list } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';

import { Role, Social, User } from './schema/user';
import { Submission } from './schema/submission';
import { Event } from './schema/event';
import { Post } from './schema/post';
import { permissions, rules } from './schema/access';
import { Run } from './schema/runs';

const session = statelessSessions({
  secret: ".MR-gkEFp'Hl0a]s4y7TJZ@:K?3x9u@CFC_+<^ldjpVL5:Fyi_2UB!)b*r3"
});

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'name roles { admin canManageUsers canManageContent canReadRunnerInfo canReadRunnerMgmt }',
  initFirstItem: {
    // These fields are collected in the "Create First User" form
    fields: ['name', 'email', 'password', 'username', 'dateOfBirth'],
    itemData: {
      role: {
        create: {
          name: 'Admin',
          admin: true,
          canManageContent: true,
          canManageUsers: true,
          canReadTech: true,
          canReadRunnerInfo: true,
          canReadRunnerMgmt: true,
        },
      },
    },
    skipKeystoneWelcome: true,
  },
});

export default withAuth(
  config({
    db: { provider: 'sqlite', url: 'file:./app.db' },
    experimental: {
      generateNextGraphqlAPI: true,
      generateNodeAPI: true,
    },
    lists: { Post, User, Submission, Event, Role, Social, Run },
    session,
    ui: {
      isAccessAllowed: permissions.canManageContent
      // isAccessAllowed: (context) => {
      //   console.log(context.session)
      //   return !!context.session
      // }
    },
    images: {
      upload: 'local',
      local: {
        storagePath: 'public/images',
        baseUrl: '/images',
      },
    }
  })
);
