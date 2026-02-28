## Plan: Implement Swiss Army Knife Blocks for Event Pages

To make the website a versatile tool for promoting events, we will implement 9 new blocks that integrate with the existing event data collections (`Events`, `Runs`, `Submissions`, `Incentives`, `Volunteers`). We will also remove the missing block imports from `Pages.ts` to fix build errors.

**Steps**
1. **Fix Missing Imports**: Remove `WordDefinition`, `UpcomingEvent`, and `RecentEvent` from `src/collections/Pages/Pages.ts` and `src/blocks/RenderBlocks.tsx`.
2. **Schedule / Itinerary Block**: Create `ScheduleBlock` in `src/blocks/ScheduleBlock/` to display a timeline/table of `Runs` for a selected `Event`.
3. **Featured Runs / Submissions Block**: Create `FeaturedRunsBlock` in `src/blocks/FeaturedRunsBlock/` to manually select and highlight specific `Runs` or `Submissions`.
4. **Event Status / Hero Block**: Create `EventHeroBlock` in `src/blocks/EventHeroBlock/` to display event dates, location, and dynamic CTAs based on event settings (e.g., "Submit Run" if `isAcceptingSubmissions`).
5. **Live Stream / Embed Block**: Create `LiveStreamBlock` in `src/blocks/LiveStreamBlock/` to embed Twitch/YouTube players and chat.
6. **Donation Tracker / Incentives Block**: Create `DonationTrackerBlock` in `src/blocks/DonationTrackerBlock/` to display active `Incentives` for a selected `Event`.
7. **Sponsor / Partner Grid Block**: Create `SponsorGridBlock` in `src/blocks/SponsorGridBlock/` to display sponsor logos in a responsive grid.
8. **Countdown Timer Block**: Create `CountdownBlock` in `src/blocks/CountdownBlock/` to build hype for an upcoming event's start time or submission deadline.
9. **FAQ / Accordion Block**: Create `FAQBlock` in `src/blocks/FAQBlock/` to display event rules and guidelines in an accordion format.
10. **Volunteer / Staff Roster Block**: Create `VolunteerRosterBlock` in `src/blocks/VolunteerRosterBlock/` to display the `Volunteers` for an event, optionally filtered by role.
11. **Register Blocks**: Add all new blocks to the `layout` array in `src/collections/Pages/Pages.ts` and the `blockComponents` map in `src/blocks/RenderBlocks.tsx`.

**Verification**
- Do not worry about verification. Focus on the implementation and styling. Verification will be done manually.

**Decisions**
- Removed missing block imports (`WordDefinition`, `UpcomingEvent`, `RecentEvent`) for now to unblock development.
- Prioritized implementing all 9 suggested blocks to provide a comprehensive "swiss army knife" experience for event organizers.
