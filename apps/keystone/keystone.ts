import 'dotenv/config';
import { config, graphql } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';
import { v4 as uuid } from 'uuid';

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
      extendPrismaSchema: (schema: any) => {
        return schema.replace(
          /(generator [^}]+)}/g,
          ['$1binaryTargets = ["native", "debian-openssl-1.1.x", "linux-musl-openssl-3.0.x", "linux-musl"]', '}'].join('\n')
        );
      },
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
          }),
        },
        mutation: {
          confirmStripe: graphql.field({
            type: base.object('Ticket'),
            args: {
              stripeID: graphql.arg({ type: graphql.nonNull(graphql.String) }),
              numberOfTickets: graphql.arg({ type: graphql.nonNull(graphql.Int) }),
              apiKey: graphql.arg({ type: graphql.nonNull(graphql.String) }),
            },
            resolve(source, { apiKey, numberOfTickets, stripeID }, context: Context) {
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
            }
          }),
          generateTicket: graphql.field({
            type: base.object('Ticket'),
            args: {
              userID: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
              numberOfTickets: graphql.arg({ type: graphql.nonNull(graphql.Int) }),
              method: graphql.arg({ type: graphql.nonNull(base.enum('TicketMethodType')) }),
              event: graphql.arg({ type: graphql.nonNull(graphql.String) }),
              stripeID: graphql.arg({ type: graphql.String }),
              apiKey: graphql.arg({ type: graphql.nonNull(graphql.String) }),
            },
            async resolve(source, { apiKey, event, method, numberOfTickets, stripeID, userID }, context: Context) {
              if (apiKey !== process.env.API_KEY) throw new Error("Incorrect API Key");

              // Check user is verified
              const userVerified = await context.sudo().query.User.findOne({ where: { id: userID }, query: 'verified' });

              if (!userVerified.verified) {
                // console.log(`Unverified user ${userID} tried to generate ticket.`)
                throw new Error('Unverified user.');
              }

              return context.sudo().db.Ticket.createOne({
                data: {
                  user: { connect: { id: userID } },
                  numberOfTickets,
                  // @ts-ignore: I do not know how to correctly type the graphql arg
                  method,
                  event: { connect: { shortname: event } },
                  stripeID: stripeID ?? uuid(),
                }
              });
            }
          }),
          confirmShirtStripe: graphql.field({
            type: base.object('ShirtOrder'),
            args: {
              stripeID: graphql.arg({ type: graphql.nonNull(graphql.String) }),
              numberOfShirts: graphql.arg({ type: graphql.nonNull(graphql.Int) }),
              apiKey: graphql.arg({ type: graphql.nonNull(graphql.String) }),
            },
            async resolve(source, { apiKey, stripeID, numberOfShirts }, context: Context) {
              if (apiKey !== process.env.API_KEY) throw new Error("Incorrect API Key");

              const notes = numberOfShirts > 0 ? `#${numberOfShirts}` : '';

              return context.sudo().db.ShirtOrder.updateOne({
                where: { stripeID },
                data: { paid: true, notes }
              });
            },
          }),
          generateShirt: graphql.field({
            type: base.object('ShirtOrder'),
            args: {
              userID: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
              method: graphql.arg({ type: graphql.nonNull(base.enum('ShirtOrderMethodType')) }),
              size: graphql.arg({ type: graphql.nonNull(base.enum('ShirtOrderSizeType')) }),
              stripeID: graphql.arg({ type: graphql.String }),
              apiKey: graphql.arg({ type: graphql.nonNull(graphql.String) }),
              notes: graphql.arg({ type: graphql.String }),
            },
            async resolve(source, { apiKey, notes, method, stripeID, size, userID }, context: Context) {
              if (apiKey !== process.env.API_KEY) throw new Error("Incorrect API Key");

              // Check user is verified
              const userVerified = await context.sudo().query.User.findOne({ where: { id: userID }, query: 'verified' });

              if (!userVerified.verified) {
                // console.log(`Unverified user ${userID} tried to generate ticket.`)
                throw new Error('Unverified user.');
              }

              if (typeof size !== 'string')
              {
                throw new Error('Unknown size.');
              }

              return context.sudo().db.ShirtOrder.createOne({
                data: {
                  user: { connect: { id: userID } },
                  size: size as any,
                  colour: 'blue',
                  // @ts-ignore: I do not know how to correctly type the graphql arg
                  method,
                  stripeID: stripeID ?? uuid(),
                  notes,
                }
              });
            }
          }),
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
