import { InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import Head from 'next/head';

// Import the generated Lists API and types from Keystone
import { query } from '.keystone/api';
import { Lists } from '.keystone/types';

// Components
import Navbar from "../components/Navbar/Navbar";
import Heroblock from "../components/Heroblock/Heroblock";
import EventDetails from "../components/EventDetails/EventDetails";
import TileGroup from "../components/Tiles/TileGroup";
import Footer from "../components/Footer/Footer";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faChevronRight, faCoins, faTicketAlt } from "@fortawesome/free-solid-svg-icons";
import TwitchChatEmbed from "../components/TwitchChatEmbed/TwitchChatEmbed";
import Ticker from "../components/Ticker/Ticker";
import { globals } from "./globals";

type Post = {
  id: string;
  title: string;
  slug: string;
};

// Home receives a `posts` prop from `getStaticProps` below
export default function Home({ posts }: InferGetStaticPropsType<typeof getStaticProps>) {
  const eventLive = false;
  const {
      events: {
        previous,
        current,
        next
    }
  } = globals;
  return (
    // <div>
    //   <main style={{ margin: '3rem' }}>
    //     <h1>Hello World! 👋🏻 </h1>
    //     <ul>
    //       {/* Render each post with a link to the content page */}
    //       {posts.map(post => (
    //         <li key={post.id}>
    //           <Link href={`/post/${post.slug}`}>
    //             <a>{post.title}</a>
    //           </Link>
    //         </li>
    //       ))}
    //     </ul>
    //   </main>
    // </div>
    <div className="App">
      <Head>
        <title>AusSpeedruns</title>
      </Head>
      <header className="App-header">
        <Navbar isLive={eventLive} />
      </header>
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
              colorScheme: "primary"
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

// Here we use the Lists API to load all the posts we want to display
// The return of this function is provided to the `Home` component
export async function getStaticProps() {
  const posts = await query.Post.findMany({ query: 'id title slug' }) as Post[];
  return {
    props: {
      posts
    }
  };
}