import React from "react";
import "./App.scss";
import Navbar from "./components/Navbar/Navbar";
import Heroblock from "./components/Heroblock/Heroblock";
import EventDetails from "./components/EventDetails/EventDetails";
import About from "./components/About/About";
import Participate from "./components/Participate/Participate";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navbar />
      </header>
      <main>
        <Heroblock />
        <EventDetails />
        <Participate />
        <About />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default App;
