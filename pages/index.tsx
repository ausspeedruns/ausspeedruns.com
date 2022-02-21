import Head from 'next/head';

// Components
import Navbar from "../components/Navbar/Navbar";
import Heroblock from "../components/Heroblock/Heroblock";
import EventDetails from "../components/EventDetails/EventDetails";
import TileGroup from "../components/Tiles/TileGroup";
import Footer from "../components/Footer/Footer";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
// import { faChevronRight, faCoins, faTicketAlt } from "@fortawesome/free-solid-svg-icons";
import TwitchChatEmbed from "../components/TwitchChatEmbed/TwitchChatEmbed";
import Ticker from "../components/Ticker/Ticker";
import { globals } from "./globals";
import DiscordEmbed from '../components/DiscordEmbed';

// Home receives a `posts` prop from `getStaticProps` below
export default function Home() {
  const eventLive = false;
  const {
      events: {
        previous,
        current,
        next
    }
  } = globals;
  return (
    <div className="App">
      <Head>
        <title>AusSpeedruns</title>
        <DiscordEmbed title='AusSpeedruns' description='Home of the AusSpeedruns events' pageUrl='/' />
      </Head>
      <Navbar isLive={eventLive} />
      <main>
        <Heroblock event={current} />
        { eventLive && <Ticker /> }
        { eventLive && <TwitchChatEmbed channel="ausspeedruns" parent={window.location.hostname}/> }
        <EventDetails event={current} />
        <TileGroup tiles={[
        {
          title: "About AusSpeedruns",
          description: "Also known as Australian Speedrunners, AusSpeedruns is a not-for-profit organisation that brings together the best speedrunners in Australia to raise money and awareness for charity at events across Australia."
        },
        {
          title: "Get Involved",
          description: `Submissions for ${current.shortName} will be open soon!`,
          anchor: "participate",
          ctas: [
            // {
            //   actionText: "Submit your run",
            //   link: "/submissions#submissionForm",
            //   iconRight: faChevronRight
            // },
            // {
            //   actionText: "Buy a ticket",
            //   link: current.website || "",
            //   iconLeft: faTicketAlt,
              
            // },
            {
              actionText: "Join our discord",
              link: globals.socialLinks.discord,
              iconLeft: faDiscord,
            }

          ]
        },
        {
          title: "Previous event",
          description: `Our last event was ${previous.fullName}, where our community helped us raise over $${previous.total} for ${previous.charity!.name}. We'd like to thank all the members of our community, our sponsors, runners and event staff for helping us run such a successful event.`
        },
      ]} />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
