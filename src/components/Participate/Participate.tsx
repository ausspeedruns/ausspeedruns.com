import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

const Participate = () => {
  return (
    <div id="participate" className="participate">
      <div className="content">
        <div>
          <h3>Get involved</h3>
          <p>
            Submissions have closed for ASM2021 but you can still get involved
            in our community. Find out what's happening and keep in touch with
            us on our discord.
          </p>
          <a className="button primary" href="//discord.ausspeedruns.com/">
            <FontAwesomeIcon icon={faDiscord} /> <span>Join us on Discord</span>
          </a>

          <h3>Next event: PAX Australia, 2021</h3>
          <p>
            Submissions for PAX Australia, 2021 will open in August. Follow us
            on Twitter or join our Discord for updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Participate;
