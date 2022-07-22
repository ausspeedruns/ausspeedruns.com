import { Globals } from "./types/types";

export const globals: Globals = {
  events: {
    previous: {
      fullName: 'Australian Speedrun Marathon 2022',
      preferredName: 'ASM2022',
      shortName: 'ASM2022',
      startDate: "13 July 2022 09:00:00 GMT+0930",
      dates: "July 13 - 17, 2022",
      total: "24,551",
      charity: {
        name: "Game On Cancer"
      },
      logo: 'ASM2022-Logo.svg',
      heroImage: 'ASM2022Hero.jpg',
    },
    current: {
      fullName: 'PAX Australia 2022',
      preferredName: 'PAX 2022',
      shortName: 'PAX2022',
      website: "https://aus.paxsite.com",
      dates: "October 7 - 9, 2022",
      charity: {
        name: "Game On Cancer"
      },
      logo: 'PAX2022 Logo White.png',
      heroImage: 'PAX2022Hero.png',
    },
    next: {
      fullName: 'Australian Speedrun Marathon 2023',
      preferredName: 'ASM2023',
      shortName: 'ASM2023',
      dates: "2023"
    },
    oldEvents: {
      'ASM2021': {
        fullName: 'Australian Speedrun Marathon 2021',
        preferredName: 'AusSpeedrun Marathon 2021',
        shortName: 'ASM2021',
        startDate: "14 July 2021 11:00:00 GMT+1000",
        dates: "14 July - 21 July, 2021",
        total: "15,000",
        charity: {
          name: "Beyond Blue"
        }
      },
      'PAX2021': {
        fullName: 'PAX Australia 2021',
        preferredName: 'PAX 2021',
        shortName: 'PAX2021',
        startDate: "08 October 2021 10:00:00 GMT+1000",
        dates: "08 October - 10 October, 2021",
        submissionFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLScI1iUqxPPP8zjJ4GPb_JvUGFmchnRb6AoDvzQF3e5b_1gh9A/viewform?embedded=true",
        website: "https://aus.paxsite.com",
        total: "7,222",
        charity: {
          name: "Cure Cancer"
        }
      }
    }
  },
  donateLink: 'http://donate.ausspeedruns.com/',
  scheduleLink: 'http://schedule.ausspeedruns.com/',
  incentivesLink: 'http://incentives.ausspeedruns.com/',
  socialLinks: {
    discord: 'http://discord.ausspeedruns.com/',
    twitter: '//twitter.com/ausspeedruns',
    youtube: '//youtube.com/ausspeedruns',
    twitch: '//twitch.tv/ausspeedruns',
    facebook: '//www.facebook.com/ausspeedruns',
    instagram: '//instagram.com/ausspeedruns',
  }
}