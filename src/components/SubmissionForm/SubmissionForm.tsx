import React from "react";
import "./SubmissionForm.scss";
import { globals } from "../../globals"

const EventDetails = () => {
  return (
    <div className="eventDetails" id="submissionForm">
      <div className="content">
        <h2>Submit your run for { globals.events.current.fullName } </h2>
        <iframe src={globals.events.current.submissionFormUrl} title={`Submissions for ${globals.events.current.preferredName}`} width="100%" height="5014" frameBorder="0">Loading…</iframe>
      </div>
    </div>
  );
};

export default EventDetails;
