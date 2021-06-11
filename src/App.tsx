import React from "react";
import "./App.scss";
import Navbar from "./components/Navbar/Navbar";
import Heroblock from "./components/Heroblock/Heroblock";
import EventDetails from "./components/EventDetails/EventDetails";
import TileGroup from "./components/Tiles/TileGroup";
import Footer from "./components/Footer/Footer";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navbar />
      </header>
      <main>
        <Heroblock />
        <EventDetails />
        <TileGroup tiles={[
          { title: "About AusSpeedruns", description: "AusSpeedruns (also known as Australian Speedrunners), is a non-profit organisation that brings together talented individuals to demonstrate their skill and entertain audiences all while raising money for various charities."},
          { title: "Get Involved", description: "Submissions for ASM2021 are closed but you can still get involved in our community. Find out what's happening and keep in touch with us on discord.", cta: { actionText: "Join our discord", link: "discord", iconLeft: faDiscord }},
          { title: "Next event", description: "Our next event will be at PAX Australia 2021. Submissions for this event will be opening in August. Follow us on Twitter or join our discord for updates."},
        ]} />
        {/* <Participate />
        <About /> */}
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default App;
