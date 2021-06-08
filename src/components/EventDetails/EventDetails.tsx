import React from 'react';
import './EventDetails.scss'

const EventDetails = () => {
  return (
    <div className="eventDetails">
      <div className="content">
        <div className="charities">
          <h3>Proudly supporting</h3>
          <div className="charity">
            Beyond Blue
          </div>
        </div>
        <div className="sponsors">
          <h3>Event sponsors</h3>
          <div className="sponsor">
            Oaks Hotels
          </div>
          <div className="sponsor">
            NVIDIA
          </div>
          <p>Sponsors and donations make our events possible. If you would like to sponsor us for a future event, get in touch!</p>
          </div>
      </div>
    </div>
  );
}

export default EventDetails;
