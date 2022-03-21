import { config, graphQLSchemaExtension, gql } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';

import { Role, User } from './schema/user';
import { Submission } from './schema/submission';
import { Event } from './schema/event';
import { Post } from './schema/post';
import { permissions, rules } from './schema/access';
import { Run } from './schema/runs';
import { Verification } from './schema/verification';

import { sendResetPassword } from './email/emails';
import { Context } from '.keystone/types';

import 'dotenv/config';
import { BaseKeystoneTypeInfo, DatabaseConfig } from '@keystone-6/core/types';

const session = statelessSessions({
  secret: process.env.SESSION_SECRET
});

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'username id roles { admin canManageUsers canManageContent canReadRunnerInfo canReadRunnerMgmt }',
  passwordResetLink: {
    sendToken: async ({ itemId, identity, token, context }) => {
      // console.log('--------------- PASSWORD RESET ---------------');
      // console.log(identity);
      // console.log(token);
      // console.log('----------------------------------------------');
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
          canReadTech: true,
          canReadRunnerInfo: true,
          canReadRunnerMgmt: true,
        },
      },
    },
    skipKeystoneWelcome: true,
  },
});

const database: DatabaseConfig<BaseKeystoneTypeInfo> = process.env.NODE_ENV === "production" ? { provider: 'postgresql', url: process.env.DATABASE_URL, enableLogging: true } : { provider: 'sqlite', url: 'file:./app.db' };

export default withAuth(
  config({
    db: database,
    experimental: {
      generateNextGraphqlAPI: true,
      generateNodeAPI: true,
    },
    lists: { Post, User, Submission, Event, Role, Run, Verification },
    extendGraphqlSchema: graphQLSchemaExtension<Context>({
      typeDefs: gql`
        type Query {
          verification(where: VerificationWhereUniqueInput!): Verification
        }
      `,
      resolvers: {
        Query: {
          verification: async (source, args, context) => {
            // Super duper hacky way but oh well
            try {
              if (!args?.where?.code) {
                return null;
              }
  
              const itemArr = await context.sudo().db.Verification.findMany({where: {code: {equals: args.where.code}}});
  
              if (itemArr.length === 1) {
                return itemArr[0];
              }
  
              return null;
            } catch (error) {
              console.log(error);
              return null;
            }
          },
        },
      }
    }),
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
    },
    files: {
      upload: 'local',
      local: {
        storagePath: 'public/files',
        baseUrl: '/files'
      }
    },
    server: {
      port: 8000,
    }
  })
);
