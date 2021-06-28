import React, {useEffect, useState} from "react";
import "./Ticker.scss";

type TickerProps = {
  scheduleId: string
};

type AgendaItem = {
  runner : string,
  gameTitle : string,
  category : string
} | null;


const Ticker = ({ scheduleId }: TickerProps) => {
  const [prevGame, setPrevGame] = useState<AgendaItem>(null);
  const [currentGame, setCurrentGame] = useState<AgendaItem>(null);
  const [nextGame, setNextGame] = useState<AgendaItem>(null);

  const convertToAgendaItem = (gameData: Array<string | null> | null) => {
    console.log(gameData);
    if (gameData && gameData.length >= 3)
      return {
        runner: gameData[0],
        gameTitle: gameData[1],
        category: gameData[2]
      } as AgendaItem
    return null
  }

  const getNextTick = () => {
    fetch(`https://australia-southeast1-utility-tempo-317111.cloudfunctions.net/grab_schedule`, {method: "GET"})
    .then(response => response.json())
    .then(res => {
      const { previous, current, next } = res.data.ticker
      setPrevGame(convertToAgendaItem(previous?.data))
      setCurrentGame(convertToAgendaItem(current?.data))
      setNextGame(convertToAgendaItem(next?.data))
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      getNextTick();
      console.log(prevGame, currentGame, nextGame);
    }, 60000);
    return () => clearInterval(interval);
  });

  return (
    <div className="ticker">
      <div className="content">
        { nextGame?.gameTitle }
      </div>
    </div>
  );
};

export default Ticker;

