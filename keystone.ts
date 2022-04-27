import 'dotenv/config';
import { config, graphQLSchemaExtension, gql } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';
import { v4 as uuid } from 'uuid';

import { Role, User } from './schema/user';
import { Submission } from './schema/submission';
import { Event } from './schema/event';
import { Post } from './schema/post';
import { permissions, rules } from './schema/access';
import { Run } from './schema/runs';
import { Verification } from './schema/verification';
import { Ticket } from './schema/tickets';

import { sendResetPassword } from './email/emails';
import { Context } from '.keystone/types';


const session = statelessSessions({
  secret: process.env.SESSION_SECRET,
  maxAge: 60 * 60 * 24 * 30 // 30 Days
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

// const database: DatabaseConfig<BaseKeystoneTypeInfo> = process.env.NODE_ENV === "production" ? { provider: 'postgresql', url: process.env.DATABASE_URL, useMigrations: true } : { provider: 'sqlite', url: 'file:./app.db', useMigrations: true };

export default withAuth(
  config({
    db: { provider: 'postgresql', url: process.env.DATABASE_URL, useMigrations: true },
    experimental: {
      generateNextGraphqlAPI: true,
      generateNodeAPI: true,
    },
    lists: { Post, User, Submission, Event, Role, Run, Verification, Ticket },
    extendGraphqlSchema: graphQLSchemaExtension<Context>({
      typeDefs: gql`
        type Query {
          verification(where: VerificationWhereUniqueInput!): Verification
        }

        type Mutation {
          """ Update stripe ticket """
          confirmStripe(stripeID: String!, numberOfTickets: Int!, apiKey: String!): Ticket

          """ Generate a ticket """
          generateTicket(userID: ID!, numberOfTickets: Int!, method: TicketMethodType!, event: String!, stripeID: String, apiKey: String!): Ticket
        }
      `,
      resolvers: {
        Query: {
          verification: async (source, args, context) => {
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
          },
        },
        Mutation: {
          confirmStripe: (root, { stripeID, numberOfTickets, apiKey }, context) => {
            if (apiKey !== process.env.API_KEY) throw new Error("Incorrect API Key");
            // if (apiKey !== process.env.API_KEY) {
            //   // Debug only
            //   console.log(`Tried to confirm stripe but had an API key error. Got ${apiKey}, expected ${process.env.API_KEY}`);
            //   return;
            // }

            return context.sudo().db.Ticket.updateOne({
              where: { stripeID },
              data: { paid: true, numberOfTickets }
            });
          },
          generateTicket: async (root, { userID, numberOfTickets, method, event, stripeID, apiKey }, context) => {
            if (apiKey !== process.env.API_KEY) throw new Error("Incorrect API Key");

            // Check user is verified
            const userVerified = await context.sudo().query.User.findOne({where: {id: userID}, query: 'verified'});

            if (!userVerified.verified) {
              // console.log(`Unverified user ${userID} tried to generate ticket.`)
              throw new Error('Unverified user.');
            }

            return context.sudo().db.Ticket.createOne({
              data: {
                user: { connect: { id: userID } },
                numberOfTickets,
                method,
                event: { connect: { shortname: event } },
                stripeID: stripeID ?? uuid(),
              }
            });
          }
        }
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
