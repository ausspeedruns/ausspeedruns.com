import React from "react";
import "./EventDetails.scss";
import beyondBlue from "../../styles/img/bblue-blue.png";
import oaksHotels from "../../styles/img/oaks-hotels.png";

const EventDetails = () => {
  return (
    <div className="eventDetails">
      <div className="content">
        <div className="charities">
          <div className="charity">
            <img src={beyondBlue} alt="Proudly supporting Beyond Blue" />
          </div>
        </div>
        <div className="sponsors">
          <h3>Event sponsors</h3>
          <div className="sponsor">
            <img src={oaksHotels} alt="Proudly supporting Beyond Blue" />
          </div>
          <p>
            Sponsors and donations make our events possible. If you would like
            to sponsor us for a future event, get in touch!
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
