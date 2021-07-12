import React, { useState } from "react";
import "./TwitchChatEmbed.scss";

type TwitchProps = {
  channel: string;
  parent: string;
  muted?: boolean;
};

const TwitchChatEmbed = ({ channel, parent, muted = true }: TwitchProps) => {
  const [showChat, setShowChat] = useState<boolean>(true)
  return (
    <div className="eventDetails">
      <div className="content">
          <button onClick={() => setShowChat(!showChat)} className="toggleChat">{ showChat ? 'Hide' : 'Show'} chat</button>
          {showChat && <div className="twitchChatEmbed">
            <iframe 
              title="Ausspeedruns twitch chat embed"
              src={`https://www.twitch.tv/embed/${channel}/chat?parent=${parent}`}
              height="<height>"
              width="<width>">
          </iframe>
        </div> }
      </div>
    </div>
  );
};

export default TwitchChatEmbed;
