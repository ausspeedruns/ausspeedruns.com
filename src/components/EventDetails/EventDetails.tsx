import React from "react";
import "./EventDetails.scss";
import beyondBlue from "../../styles/img/bblue-blue.png";
import oaksHotels from "../../styles/img/oaks-hotels.png";
import { globals } from "../../globals"

const EventDetails = () => {
  return (
    <div className="eventDetails">
      <div className="content">
        <h2>About AusSpeedrun Marathon 2021</h2>
        <p>Due to COVID-19 restrictions, ASM2021 will be hosted entirely online. For more details about in-person event ticket and tshirt sales, please <a href={globals.socialLinks.discord}>join our discord</a>.</p>
        <div className="charitiesAndSponsors">
          <div className="charities">
            <div className="charity">
              <a href={globals.donateLink}><img src={beyondBlue} alt="Proudly supporting Beyond Blue" /><span className="sr-only">Proudly supporting Beyond Blue</span></a>
            </div>
          </div>
          <div className="sponsorsSection">
            <h3>Partners and Sponsors</h3>
            <div className="sponsors">
              <div className="sponsor">
                <img src={oaksHotels} alt="Proudly supporting Beyond Blue" />
              </div>
              {/* <div className="sponsor">
                <img src={oaksHotels} alt="Proudly supporting Beyond Blue" />
              </div> */}
              <p>
                Sponsors and donations make our events possible. If you would like
                to sponsor us for a future event, get in touch!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
