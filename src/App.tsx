import React, { useEffect, useState } from "react";
import "./App.scss";
import Navbar from "./components/Navbar/Navbar";
import Heroblock from "./components/Heroblock/Heroblock";
import EventDetails from "./components/EventDetails/EventDetails";
import TileGroup from "./components/Tiles/TileGroup";
import Footer from "./components/Footer/Footer";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import TwitchChatEmbed from "./components/TwitchChatEmbed/TwitchChatEmbed";
import Ticker from "./components/Ticker/Ticker";
import { globals } from "./globals";

function App() {
  const [eventLive, setEventLive] = useState<boolean>(false);
  const [countDownInterval, setCountDownInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const eventDate = Date.parse(globals.events.current.date);

    if (!countDownInterval) {
      setCountDownInterval(setInterval(function() {
        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = eventDate - now;

        // Time calculations for days, hours, minutes and seconds
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        // If the count down is finished, write some text
        if (!eventLive && minutes < 20) {
          console.log("Going live...");
          setEventLive(true);
          if (countDownInterval)
            clearInterval(countDownInterval);
        }
      }, 5000))
    }
  }, [eventLive, countDownInterval])



  return (
    <div className="App">
      <header className="App-header">
        <Navbar />
      </header>
      <main>
        <Heroblock />
        { eventLive && <Ticker /> }
        { eventLive && <TwitchChatEmbed channel="ausspeedruns" parent={window.location.hostname}/> }
        <EventDetails />
        <TileGroup tiles={[
          {
            title: "About AusSpeedruns",
            description: "Also known as Australian Speedrunners, AusSpeedruns is a not-for-profit organisation that brings together the best speedrunners in Australia to raise money and awareness for charity at events across Australia."
          },
          {
            title: "Get Involved",
            description: "Submissions have closed for ASM2021 but you can still get involved in our community. Find out what's happening and keep in touch with us on our discord.",
            anchor: "participate",
            cta: {
              actionText: "Join our discord",
              link: globals.socialLinks.discord,
              iconLeft: faDiscord
            }
          },
          {
            title: "Next event",
            description: "Our next event will be at PAX Australia 2021. Submissions for this event will be opening in August. Follow us on Twitter or join our discord for updates."
          },
        ]} />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default App;
