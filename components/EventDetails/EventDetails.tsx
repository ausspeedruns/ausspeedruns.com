import React from "react";
import styles from "./EventDetails.module.scss";
import Image from 'next/image';
import beyondBlue from "../../styles/img/bblue-blue.png";
// import oaksHotels from "../../styles/img/oaks-hotels.png";
// import landfall from "../../styles/img/Landfall_Logo_1.png";
import { globals } from "../../pages/globals"
import { AusSpeedrunsEvent } from "../../types/types";

type EventDetailsProps = {
  event: AusSpeedrunsEvent
}

const EventDetails = ( { event } : EventDetailsProps) => {
  return (
    <div className={styles.eventDetails}>
      <div className={`${styles.content} content`}>
        <h2>About {event.fullName}</h2>
        {/* <p></p> */}
        <div className={styles.charitiesAndSponsors}>
          <div className={styles.charities}>
            <h3>{event.shortName} Charity</h3>
            <div className={styles.charity}>
              <a href={globals.donateLink}><img src={beyondBlue.src} alt="Proudly supporting Beyond Blue" /><span className="sr-only">Proudly supporting Beyond Blue</span></a>
              {/* <a href={globals.donateLink}><Image width={640} height={314} src={beyondBlue} alt="Proudly supporting Beyond Blue" /><span className="sr-only">Proudly supporting Beyond Blue</span></a> */}
            </div>
          </div>
          {/* <div className={styles.sponsorsSection}>
            <div className={styles.sponsors}>
            <h3>ASM2021 Sponsor</h3>
              <div className={styles.sponsor}>
                <a href="https://landfall.se/"><Image src={landfall} alt="Sponsored by Landfall Games" /><span className="sr-only">Sponsored by Landfall Games</span></a>
              </div>
            </div>
          </div> */}
        </div>
        <p>
          Sponsors and donations make our events possible. If you would like
          to sponsor us for a future event, get in touch!
        </p>
      </div>
    </div>
  );
};

export default EventDetails;
