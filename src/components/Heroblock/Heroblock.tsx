import React from "react";
import "./Heroblock.scss";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Countdown, { zeroPad, CountdownRenderProps } from "react-countdown";
import Button from "../Button/Button";
import TwitchVideoEmbed from "../TwitchVideoEmbed/TwitchVideoEmbed";
import { globals } from "../../globals";
import { AusSpeedrunsEvent } from "../../types";

type HeroblockProps = {
  event: AusSpeedrunsEvent
}


const Heroblock = ({event}: HeroblockProps) => {
  const showVideoBlock = false;
  const countdownRender = ({
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    completed,
  }: CountdownRenderProps) => {
    // if (completed || (days <= 1 && hours < 1  && minutes < 20)) {
    //   setShowVideoBlock(true)
    // }

    if (completed) return <span></span>;
    else if (days > 0)
      return (
        <span>
          <span className="sr-only">
            {days} days, {hours} hours, {minutes} minutes and {seconds} seconds
            remaining
          </span>
          <span aria-hidden>
            {zeroPad(days)}:{zeroPad(hours)}:{zeroPad(minutes)}:
            {zeroPad(seconds)}
          </span>
        </span>
      );
    else if (hours > 0)
      return (
        <span>
          <span className="sr-only">
            {hours} hours, {minutes} minutes and {seconds} seconds remaining
          </span>
          <span aria-hidden>
            {zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
          </span>
        </span>
      );
    else
      return (
        <span>
          <span className="sr-only">
            {minutes} minutes and {seconds} seconds
            remaining
          </span>
          <span aria-hidden>
            {zeroPad(minutes)}:{zeroPad(seconds)}
          </span>
        </span>
      );
  };

  return (
    <div className="heroblock">
      <div className="content">
        { showVideoBlock && (<TwitchVideoEmbed channel="ausspeedruns" parent={window.location.hostname}/>) }
        <div className="ctaBlock">
          <h1>{event.fullName}</h1>
          <h2>{event.dates}</h2>
          <br/>
          {/* <h3 className="countdown monospaced">
            { event.startDate && 
              <Countdown
                date={Date.parse(event.startDate)}
                renderer={countdownRender}
                zeroPadTime={2}
              />
            }
          </h3> */}
          <p>
            Submissions for {event.shortName} are now open! Pending COVID restrictions, our event will be hosted at the Melbourne Convention &amp; Exhibition Centre during PAX Aus. Tickets for general attendance are available on the <a href={event.website}>PAX website</a>.
          </p>
          <Button actionText="Get involved" link="/#participate" iconRight={ faChevronRight } colorScheme={"primary lightHover"}/>
          {/* {event.website && <Button actionText="Buy tickets" link={event.website} iconRight={ faChevronRight } colorScheme={"primary inverted"}/> } */}
        </div>
      </div>
    </div>
  );
};

export default Heroblock;
