import React from 'react';
import './Heroblock.scss'
import '../../styles/buttons.scss'
import TwitchEmbed from './TwitchEmbed'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Heroblock = () => {
  return (
    <div className="heroblock">
      <div className="content">
        <TwitchEmbed channel="ausspeedruns" parent={window.location.hostname}/>
        <div className="ctaBlock">
          <h1>Australian Speedrun Marathon 2021</h1>
          <h2>July 13th - 18th</h2>
          <p>Australian Speedrunners come together to raise money for Beyond Blue at ASM2021! Hosted at the Oaks Adelaide Embassy Suites, Australia.</p>
          <a className="button primary" href="#">Donate <FontAwesomeIcon icon={ faChevronRight } /></a>
        </div>
      </div>
    </div>
  );
}

export default Heroblock;
