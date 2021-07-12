import React from "react";
import "./EventDetails.scss";
import Sponsors from "./Sponsors"
import beyondBlue from "../../styles/img/bblue-blue.png";
// import oaksHotels from "../../styles/img/oaks-hotels.png";

const EventDetails = () => {
  return (
    <div className="eventDetails">
      <div className="content">
        <h2>About AusSpeedrun Marathon 2021</h2>
        <p>Due to COVID-19 restrictions, ASM2021 will be hosted entirely online. For more details about ticket and tshirt sales, please <a href="https://discord.com/invite/2xFkJta">join our discord</a>.</p>
        <div className="charitiesAndSponsors">
          <div className="charities">
            <div className="charity">
              <img src={beyondBlue} alt="Proudly supporting Beyond Blue" />
            </div>
          </div>
          <div className="sponsorsSection">
            <h3>Recent donations</h3>
            <Sponsors />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
