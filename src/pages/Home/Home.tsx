import React from "react";
import EventDetails from "../../components/EventDetails/EventDetails";
import TileGroup from "../../components/Tiles/TileGroup";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
// import TwitchChatEmbed from "./components/TwitchChatEmbed/TwitchChatEmbed";
// import Ticker from "./components/Ticker/Ticker";
import { globals } from "../../globals";
import { AusSpeedrunsEvent, EventsLineUp } from "../../types";
import { faChevronRight, faCoins, faTicketAlt } from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  const {
      events: {
        previous,
        current,
        next
    }
  } = globals;

  return (
    <div>
      <EventDetails event={previous}/>
      <TileGroup tiles={[
        {
          title: "About AusSpeedruns",
          description: "Also known as Australian Speedrunners, AusSpeedruns is a not-for-profit organisation that brings together the best speedrunners in Australia to raise money and awareness for charity at events across Australia."
        },
        {
          title: "Get Involved",
          description: `Submissions for ${current.shortName} are now open!`,
          anchor: "participate",
          ctas: [
            {
              actionText: "Submit your run",
              link: "/submissions#submissionForm",
              iconRight: faChevronRight
            },
            {
              actionText: "Buy a ticket",
              link: current.website || "",
              iconLeft: faTicketAlt,
              
            },
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
  </div>
  )
}


export default Home;