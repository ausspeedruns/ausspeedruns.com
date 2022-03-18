-- CreateEnum
CREATE TYPE "PostRoleType" AS ENUM ('public', 'runner', 'tech', 'runner_management');

-- CreateEnum
CREATE TYPE "UserStateType" AS ENUM ('none', 'vic', 'nsw', 'qld', 'sa', 'wa', 'act', 'nt', 'tas', 'outer');

-- CreateEnum
CREATE TYPE "SubmissionAgeRatingType" AS ENUM ('m_or_lower', 'ma15', 'ra18');

-- CreateEnum
CREATE TYPE "SubmissionRaceType" AS ENUM ('no', 'solo', 'only');

-- CreateEnum
CREATE TYPE "SubmissionStatusType" AS ENUM ('submitted', 'accepted', 'backup', 'rejected');

-- CreateEnum
CREATE TYPE "RoleTextColourType" AS ENUM ('white', 'black');

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT E'',
    "slug" TEXT NOT NULL DEFAULT E'',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedDate" TIMESTAMP(3),
    "editedDate" TIMESTAMP(3),
    "role" "PostRoleType",
    "content" JSONB NOT NULL DEFAULT E'[{"type":"paragraph","children":[{"text":""}]}]',
    "intro" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "username" TEXT NOT NULL DEFAULT E'',
    "email" TEXT NOT NULL DEFAULT E'',
    "password" TEXT NOT NULL,
    "accountCreated" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "dateOfBirth" TIMESTAMP(3),
    "pronouns" TEXT NOT NULL DEFAULT E'',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "state" "UserStateType" DEFAULT E'none',
    "sentVerification" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetIssuedAt" TIMESTAMP(3),
    "passwordResetRedeemedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "runner" TEXT,
    "created" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "game" TEXT NOT NULL DEFAULT E'',
    "category" TEXT NOT NULL DEFAULT E'',
    "platform" TEXT NOT NULL DEFAULT E'',
    "estimate" TEXT NOT NULL DEFAULT E'',
    "ageRating" "SubmissionAgeRatingType" DEFAULT E'm_or_lower',
    "donationIncentive" TEXT NOT NULL DEFAULT E'',
    "specialReqs" TEXT NOT NULL DEFAULT E'',
    "availability_json" JSONB,
    "race" "SubmissionRaceType" DEFAULT E'no',
    "racer" TEXT NOT NULL DEFAULT E'',
    "coop" BOOLEAN NOT NULL DEFAULT false,
    "video" TEXT NOT NULL DEFAULT E'',
    "status" "SubmissionStatusType" DEFAULT E'submitted',
    "event" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "shortname" TEXT NOT NULL DEFAULT E'',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "raised" DOUBLE PRECISION,
    "acceptingSubmissions" BOOLEAN NOT NULL DEFAULT false,
    "logo_filesize" INTEGER,
    "logo_extension" TEXT,
    "logo_width" INTEGER,
    "logo_height" INTEGER,
    "logo_id" TEXT,
    "pressKit_filename" TEXT,
    "pressKit_filesize" INTEGER,
    "submissionInstructions" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT E'',
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "canManageContent" BOOLEAN NOT NULL DEFAULT false,
    "canManageUsers" BOOLEAN NOT NULL DEFAULT false,
    "canReadTech" BOOLEAN NOT NULL DEFAULT false,
    "canReadRunnerInfo" BOOLEAN NOT NULL DEFAULT false,
    "canReadRunnerMgmt" BOOLEAN NOT NULL DEFAULT false,
    "event" TEXT,
    "show" BOOLEAN NOT NULL DEFAULT false,
    "colour" TEXT NOT NULL DEFAULT E'#ffffff',
    "textColour" "RoleTextColourType",

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Social" (
    "id" TEXT NOT NULL,
    "discord" TEXT NOT NULL DEFAULT E'',
    "twitter" TEXT NOT NULL DEFAULT E'',
    "twitch" TEXT NOT NULL DEFAULT E'',
    "user" TEXT,

    CONSTRAINT "Social_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL,
    "originalSubmission" TEXT,
    "game" TEXT NOT NULL DEFAULT E'',
    "category" TEXT NOT NULL DEFAULT E'',
    "platform" TEXT NOT NULL DEFAULT E'',
    "estimate" TEXT NOT NULL DEFAULT E'',
    "finalTime" TEXT NOT NULL DEFAULT E'',
    "donationIncentive" TEXT NOT NULL DEFAULT E'',
    "race" BOOLEAN NOT NULL DEFAULT false,
    "racer" TEXT NOT NULL DEFAULT E'',
    "coop" BOOLEAN NOT NULL DEFAULT false,
    "twitchVOD" TEXT NOT NULL DEFAULT E'',
    "youtubeVOD" TEXT NOT NULL DEFAULT E'',
    "event" TEXT,
    "scheduledTime" TIMESTAMP(3),

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT E'',
    "account" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Post_author" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Role_users" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Run_runners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Submission_runner_idx" ON "Submission"("runner");

-- CreateIndex
CREATE INDEX "Submission_event_idx" ON "Submission"("event");

-- CreateIndex
CREATE UNIQUE INDEX "Event_shortname_key" ON "Event"("shortname");

-- CreateIndex
CREATE INDEX "Role_event_idx" ON "Role"("event");

-- CreateIndex
CREATE UNIQUE INDEX "Social_user_key" ON "Social"("user");

-- CreateIndex
CREATE INDEX "Run_originalSubmission_idx" ON "Run"("originalSubmission");

-- CreateIndex
CREATE INDEX "Run_event_idx" ON "Run"("event");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_code_key" ON "Verification"("code");

-- CreateIndex
CREATE UNIQUE INDEX "_Post_author_AB_unique" ON "_Post_author"("A", "B");

-- CreateIndex
CREATE INDEX "_Post_author_B_index" ON "_Post_author"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Role_users_AB_unique" ON "_Role_users"("A", "B");

-- CreateIndex
CREATE INDEX "_Role_users_B_index" ON "_Role_users"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Run_runners_AB_unique" ON "_Run_runners"("A", "B");

-- CreateIndex
CREATE INDEX "_Run_runners_B_index" ON "_Run_runners"("B");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_runner_fkey" FOREIGN KEY ("runner") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_event_fkey" FOREIGN KEY ("event") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_event_fkey" FOREIGN KEY ("event") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Social" ADD CONSTRAINT "Social_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_originalSubmission_fkey" FOREIGN KEY ("originalSubmission") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_event_fkey" FOREIGN KEY ("event") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_author" ADD FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Post_author" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Role_users" ADD FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Role_users" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Run_runners" ADD FOREIGN KEY ("A") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Run_runners" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
