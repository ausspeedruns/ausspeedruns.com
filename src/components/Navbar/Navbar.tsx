import React, { useEffect, useState } from "react";
import "./Navbar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitch,
  faTwitter,
  faDiscord,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState<Boolean>(false);
  const [isMobile, setIsMobile] = useState<Boolean>(true);
  
  useEffect(() => {
    window.addEventListener('resize', () => {
      setIsMobile(window.innerWidth < 768)
    })
  })

  return (
    <div className="navbar">
      <div className="content">
        <div className="title">
          <a href="/">
            <span className="logo"></span>
            <h1>AusSpeedruns</h1>
          </a>
        </div>
        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen.valueOf()}>
          { !isOpen ? (
          <FontAwesomeIcon icon={faBars} />
          ) : (
            <FontAwesomeIcon icon={faTimes} />
          )}
          <span className="sr-only">Menu</span>
        </button>
        { isMobile ? (<div className="break"></div>
        ) : ''}
        
        <nav className={`main-menu ${isOpen ? 'menu-open' : 'menu-closed'}`} aria-label="Main menu">
          <ul>
            <li>
              <a href="//schedule.ausspeedruns.com">Schedule</a>
            </li>
            {/* <li><a href="//incentives.ausspeedruns.com">Incentives</a></li> */}
            <li>
              <a href="#participate">Get Involved</a>
            </li>
            <li className="social">
              <a href="//www.twitch.tv/ausspeedruns">
                <FontAwesomeIcon icon={faTwitch} />
                <span className={`text ${isMobile ? '' : 'sr-only'}`}>Follow us on Twitch</span>
              </a>
            </li>
            <li className="social">
              <a href="//twitter.com/ausspeedruns">
                <FontAwesomeIcon icon={faTwitter} />
                <span className={`text ${isMobile ? '' : 'sr-only'}`}>Follow us on Twitter</span>
              </a>
            </li>
            <li className="social">
              <a href="//youtube.com/ausspeedruns">
                <FontAwesomeIcon icon={faYoutube} />
                <span className={`text ${isMobile ? '' : 'sr-only'}`}>Subscribe to AusSpeedruns on Youtube</span>
              </a>
            </li>
            <li className="social">
              <a href="//discord.ausspeedruns.com/">
                <FontAwesomeIcon icon={faDiscord} />
                <span className={`text ${isMobile ? '' : 'sr-only'}`}>Join us on Discord</span>
              </a>
            </li>
            {/* <li><a className="button secondary" href="//fundraise.beyondblue.org.au/asm2021">Donate</a></li> */}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
