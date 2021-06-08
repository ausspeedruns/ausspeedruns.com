import React from "react";
import "./TwitchEmbed.scss";

type TwitchProps = {
  channel: string;
  parent: string;
  muted?: boolean;
};

const TwitchEmbed = ({ channel, parent, muted = true }: TwitchProps) => {
  return (
    <div className="twitchEmbed">
      <iframe
        title="Ausspeedruns twitch player"
        src={`https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=${muted}`}
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default TwitchEmbed;
