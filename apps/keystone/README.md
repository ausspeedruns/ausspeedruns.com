# AusSpeedruns Keystone

> Website that runs ausspeedruns.com and it's back-end CMS

## Getting Started

First, run the development server:

```bash
yarn run dev
```

Open [http://localhost:8000](http://localhost:8000) to access the KeystoneJS admin UI.

## Schedule Importer

When uploading a schedule to the schedule importer the csv file must have these headers:

- runner
- game
- category
- platform
- estimate
- donationIncentive
- race
  - It is considered a race if there is anything other than an empty cell or "no"
- racer
- coop

Not required but is used to match up with relations in the database

- runnerId
- submissionId

If a game is labelled as `Setup Buffer`, it will be automatically marked as such and the username will be AusSpeedruns.

## .env

The format for the required items in the .env file are as such.

```.env
# Azure Storage
AZURE_STORAGE_ACCOUNT_NAME="devstoreaccount1"
AZURE_STORAGE_KEY="<Azure storage key>"
AZURE_STORAGE_CONTAINER="<Azure storage container>"

# Database
DATABASE_URL="postgres://postgres:postgres@localhost:5432/keystone"

# Email
EMAIL_USER="<Email User>"
EMAIL_PASS="<Email Pass>"

# Stripe
STRIPE_SECRET_KEY="<Stripe secret key>"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="<Public Stripe public key>"
STRIPE_WEBHOOK_SECRET="<Stripe webhook secret>"

# Custom
NODE_ENV="development"
KEYSTONE_URL="http://localhost:8000/api/graphql"
SESSION_SECRET="<Session secret>"
API_KEY="<Api key>"
```

## Seed data

**RUN THE STARTUP ONCE BEFORE RUNNING THE SEEDING SCRIPT**. This is to generate an admin user which is yourself. Then run `yarn run seed`.

There is a seeding script that has:

- 5 users
- 3 events
  - 1 unpublished
  - 1 live
  - 1 past
- 10 runs
- 4 submissions

### User accounts

| Email                | Password  | Username | Comments    |
| -------------------- | --------- | -------- | ----------- |
| glados@example.com   | 123456789 | GLaDOS   | Coordinator |
| chell@example.com    | 123456789 | Chell    | Runner      |
| pbody@example.com    | 123456789 | P-Body   | Runner      |
| atlas@example.com    | 123456789 | Atlas    | Runner      |
| wheatley@example.com | 123456789 | Wheatley | Unverified  |

## Testing Images/Uploaded Data

As the website uses Azure Blob Storage to upload files we need to use the Azure Blob emulator. This is called Azurite. However we must create the storage container. The best way I have determined is by downloading _Microsoft Azure Storage Explorer_ then going `Local & Attached > Storage Accounts > Azurite (Key) > Blob Containers` right clicking Blob Containers and creating a new blob storage called `keystone-uploads`. Right click and Make the public access level to allow both blobs and containers.

## Collapsing migrations

Each commit should only have one migration. However during development you may create multiple migrations which need to be collapsed. **Unfortunately this will delete your local database. Make sure to add any new features to the seed data so we can test it in the future.**

1. Delete all new mutations.
2. Re-run `keystone dev`
3. Name the new mutation
