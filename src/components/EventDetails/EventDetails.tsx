import React from "react";
import "./EventDetails.scss";
import beyondBlue from "../../styles/img/bblue-blue.png";
// import oaksHotels from "../../styles/img/oaks-hotels.png";
import landfall from "../../styles/img/Landfall_Logo_1.png";
import { globals } from "../../globals";
import { AusSpeedrunsEvent } from "../../types";

type EventDetailsProps = {
  event: AusSpeedrunsEvent
}

const EventDetails = ( { event } : EventDetailsProps) => {
  return (
    <div className="eventDetails">
      <div className="content">
        <h2>About {event.fullName}</h2>
        {/* <p></p> */}
        <div className="charitiesAndSponsors">
          <div className="charities">
            <h3>{event.shortName} Charity</h3>
            <div className="charity">
              <a href={globals.donateLink}><img src={beyondBlue} alt="Proudly supporting Beyond Blue" /><span className="sr-only">Proudly supporting Beyond Blue</span></a>
            </div>
          </div>
          <div className="sponsorsSection">
            <div className="sponsors">
            <h3>ASM2021 Sponsor</h3>
              <div className="sponsor">
                <a href="https://landfall.se/"><img src={landfall} alt="Sponsored by Landfall Games" /><span className="sr-only">Sponsored by Landfall Games</span></a>
              </div>
            </div>
          </div>
        </div>
        <p>
          At ASM2021 we were able to raise over ${event.total} but we couldn't have done so without our incredible sponsors, volunteers, donations and support from our community. This total only includes donations made directly to Beyond Blue, and the complete total including money from Twitch subs will be updated in coming days. If you would like
          to sponsor us for a future event, get in touch!
        </p>
      </div>
    </div>
  );
};

export default EventDetails;
