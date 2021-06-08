import React from 'react';
import './Navbar.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTwitch, faTwitter, faDiscord, faYoutube
} from '@fortawesome/free-brands-svg-icons'

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="title">
        <a href="/"><span className="logo"></span><span>AusSpeedruns</span></a>
      </div>
      <nav>
        <ul>
          <li><a href="//schedule.ausspeedruns.com">Schedule</a></li>
          <li><a href="//incentives.ausspeedruns.com">Incentives</a></li>
          <li className="social">
            <a href="//www.twitch.tv/ausspeedruns">
              <FontAwesomeIcon icon={faTwitch} />
              <span className="text">Twitch</span>
            </a>
          </li>
          <li className="social">
            <a href="//twitter.com/ausspeedruns">
              <FontAwesomeIcon icon={faTwitter} />
              <span className="text">Twitter</span>
            </a>
          </li>
          <li className="social">
            <a href="http://youtube.com/ausspeedruns">
              <FontAwesomeIcon icon={faYoutube} />
              <span className="text">Youtube</span>
            </a>
          </li>
          <li className="social">
            <a href="http://discord.ausspeedruns.com/">
              <FontAwesomeIcon icon={faDiscord} />
              <span className="text">Discord</span>
            </a>
          </li>
          <li><a className="button secondary" href="//donate.ausspeedruns.com">Donate</a></li>
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
