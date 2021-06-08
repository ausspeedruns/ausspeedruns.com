import React from 'react';
import './App.scss';
import Navbar from './components/Navbar/Navbar';
import Heroblock from './components/Heroblock/Heroblock'
import EventDetails from './components/EventDetails/EventDetails'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navbar />
      </header>
      <Heroblock />
      <EventDetails />
      {/* <About /> */}
    </div>
  );
}

export default App;
