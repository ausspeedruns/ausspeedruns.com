import React from "react";
import "./App.scss";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Submissions from "./pages/Submissions/Submissions";
import HeroBlock from "./components/Heroblock/Heroblock";
import { globals } from "./globals";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

function App() {
  const eventLive = false;

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Navbar isLive={eventLive} />
        </header>
        <main>
          <HeroBlock event={globals.events.current} />
          <Switch>
            <Route path="/submissions">
              <Submissions />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
    </Router>
  );
}

export default App;
