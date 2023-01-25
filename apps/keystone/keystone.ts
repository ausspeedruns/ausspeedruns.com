import 'dotenv/config';
import { config, graphql } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';

import { Role, User } from './src/schema/user';
import { Submission } from './src/schema/submission';
import { Event } from './src/schema/event';
import { Post } from './src/schema/post';
import { permissions, rules } from './src/schema/access';
import { Run } from './src/schema/runs';
import { Verification } from './src/schema/verification';
import { Ticket } from './src/schema/tickets';

import { sendResetPassword } from './src/email/emails';
import { Context } from '.keystone/types';
import { Volunteer } from './src/schema/volunteers';
import { ShirtOrder } from './src/schema/orders';
import { Incentive } from './src/schema/incentives';
import { insertSeedData } from './src/seed/seed';

const session = statelessSessions({
  secret: process.env.SESSION_SECRET,
  maxAge: 60 * 60 * 24 * 30 // 30 Days
});

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'username id roles { admin canManageUsers canManageContent runner volunteer event { shortname } }',
  passwordResetLink: {
    sendToken: async ({ itemId, identity, token, context }) => {
      sendResetPassword(identity, token);
    }
  },
  initFirstItem: {
    // These fields are collected in the "Create First User" form
    fields: ['name', 'email', 'password', 'username', 'dateOfBirth'],
    itemData: {
      roles: {
        create: {
          name: 'Admin',
          admin: true,
          canManageContent: true,
          canManageUsers: true,
          runner: true,
          volunteer: true,
        },
      },
    },
    skipKeystoneWelcome: true,
  },
});

export default withAuth(
  config({
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL,
      useMigrations: true,
      async onConnect(context: Context) {
        if (process.argv.includes('--seed-data')) {
          await insertSeedData(context.sudo());
        }
      },
    },
    experimental: {
      generateNextGraphqlAPI: true,
    },
    lists: { Post, User, Submission, Event, Role, Run, Verification, Ticket, Volunteer, ShirtOrder, Incentive },
    extendGraphqlSchema: graphql.extend(base => {
      return {
        query: {
          accountVerification: graphql.field({
            type: base.object('Verification'),
            args: {
              where: graphql.arg({ type: graphql.nonNull(base.inputObject('VerificationWhereUniqueInput')) }),
            },
            async resolve(source, args, context: Context) {
              // Super duper hacky way but oh well
              try {
                if (!args?.where?.code) {
                  throw new Error("Missing code query");
                }

                const itemArr = await context.sudo().db.Verification.findMany({ where: { code: { equals: args.where.code } } });

                if (itemArr.length === 1) {
                  return itemArr[0];
                }

                throw new Error("Couldn't find code or found too many.");
              } catch (error) {
                throw new Error(error);
              }
            }
          })
        }
      }
    }),
    session,
    ui: {
      isAccessAllowed: permissions.canManageContent
    },
    server: {
      port: 8000,
    },
  })
);
