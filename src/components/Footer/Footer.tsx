import {
  faTwitch,
  faTwitter,
  faYoutube,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import "./Footer.scss";

const Footer = () => {
  return (
    <div>
      <div className="acknowledgement">
        <div className="content">
          <p>
            In the spirit of reconciliation, Australian Speedrunners
            acknowledges the Traditional Custodians of country throughout
            Australia and their connections to land, sea and community. We pay
            our respect to their elders past and present and extend that respect
            to all Aboriginal and Torres Strait Islander peoples today.
          </p>
        </div>
      </div>
      <div className="footer">
        <div className="content">
          <ul>
            <li className="social">
              <a href="//www.twitch.tv/ausspeedruns">
                <FontAwesomeIcon icon={faTwitch} />
                <span className="text">Follow us on Twitch</span>
              </a>
            </li>
            <li className="social">
              <a href="//twitter.com/ausspeedruns">
                <FontAwesomeIcon icon={faTwitter} />
                <span className="text">Follow us on Twitter</span>
              </a>
            </li>
            <li className="social">
              <a href="http://youtube.com/ausspeedruns">
                <FontAwesomeIcon icon={faYoutube} />
                <span className="text">
                  Subscribe to AusSpeedruns on Youtube
                </span>
              </a>
            </li>
            <li className="social">
              <a href="http://discord.ausspeedruns.com/">
                <FontAwesomeIcon icon={faDiscord} />
                <span className="text">Join us on Discord</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Footer;
