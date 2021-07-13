import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import "./TwitchChatEmbed.scss";

type TwitchProps = {
  channel: string;
  parent: string;
  muted?: boolean;
};

const TwitchChatEmbed = ({ channel, parent, muted = true }: TwitchProps) => {
  const [showChat, setShowChat] = useState<boolean>(false)
  return (
    <div className="twitchChat">
      <div className="content">
          <button onClick={() => setShowChat(!showChat)} className="toggleChat"><span>{ showChat ? 'Hide' : 'Show'} chat </span><FontAwesomeIcon icon={showChat ? faChevronUp : faChevronDown} /></button>
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
