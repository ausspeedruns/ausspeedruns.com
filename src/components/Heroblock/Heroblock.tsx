import React from "react";
import "./Heroblock.scss";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Countdown, { zeroPad, CountdownRenderProps } from "react-countdown";
import Button from "../Button/Button";
// import TwitchEmbed from "./TwitchEmbed";

const Heroblock = () => {
  const countdownRender = ({
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    completed,
  }: CountdownRenderProps) => {
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
            {minutes} minutes, {seconds} seconds and {milliseconds} milliseconds
            remaining
          </span>
          <span aria-hidden>
            {zeroPad(minutes)}:{zeroPad(seconds)}:{zeroPad(milliseconds)}
          </span>
        </span>
      );
  };

  return (
    <div className="heroblock">
      <div className="content">
        {/* <TwitchEmbed channel="ausspeedruns" parent={window.location.hostname}/> */}
        <div className="ctaBlock">
          <h1>Australian Speedrun Marathon 2021</h1>
          <h2>July 14th - 18th</h2>
          <h3 className="countdown monospaced">
            <Countdown
              date={Date.parse("13 July 2021 11:00:00 GMT+1000")}
              renderer={countdownRender}
              zeroPadTime={2}
            />
          </h3>
          <p>
            Australian Speedrunners come together to raise money for Beyond Blue
            at ASM2021!
          </p>
          {/* <a className="button primary" href="//fundraise.beyondblue.org.au/asm2021">Donate <FontAwesomeIcon icon={ faChevronRight } /></a> */}
          <Button actionText="Get Involved" link="#participate" iconRight={ faChevronRight} colorScheme={"primary lightHover"}/>
        </div>
      </div>
    </div>
  );
};

export default Heroblock;
