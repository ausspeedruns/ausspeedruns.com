import React, {useEffect, useState} from "react";
import Marquee from "react-fast-marquee";
import Donations from "../EventDetails/Donations";
import styles from "./Ticker.module.scss";

type AgendaItem = {
  runner : string,
  gameTitle : string,
  category : string
} | null;


const Ticker = () => {
  const [prevGame, setPrevGame] = useState<AgendaItem>(null);
  const [currentGame, setCurrentGame] = useState<AgendaItem>(null);
  const [nextGame, setNextGame] = useState<AgendaItem>(null);
  const runnerRegex = /(\[)([^\[]+)(\])(\()([^\)]+)(\))/gi;

  const convertToAgendaItem = (gameData: Array<string | null> | null) => {
    if (gameData && gameData.length >= 3)
      return {
        runner: gameData[0] && runnerRegex.test(gameData[0]) ? gameData[0].replace(runnerRegex, '$2') : gameData[0],
        gameTitle: gameData[1],
        category: gameData[2]
      } as AgendaItem
    return null
  }

  // const getNextTick = () => {
  //   fetch(`https://australia-southeast1-utility-tempo-317111.cloudfunctions.net/grab_schedule`, {method: "GET"})
  //   .then(response => response.json())
  //   .then(res => {
  //     const { previous, current, next } = res.data.ticker
  //     setPrevGame(convertToAgendaItem(previous?.data))
  //     setCurrentGame(convertToAgendaItem(current?.data))
  //     setNextGame(convertToAgendaItem(next?.data))
  //   })
  // }

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     getNextTick();
  //   }, 5000);
  //   return () => clearInterval(interval);
  // });

  return (
    <div className={styles.ticker}>
      <div className="content">
        <Marquee
          pauseOnHover={true}
          className={styles.tickerWrapper}
          gradientColor={[252, 245, 238]}
        >
          {prevGame && (
            <p><strong>Previous game: </strong>{ prevGame.runner} - { prevGame.gameTitle } { prevGame.category } </p>
          )}
          {currentGame && (
            <p><strong>Currently playing: </strong>{ currentGame.runner} - { currentGame.gameTitle } { currentGame.category } </p>
          )}
          {nextGame && (
            <p><strong>Up next: </strong>{ nextGame.runner} - { nextGame.gameTitle } { nextGame.category } </p>
          )}
          <Donations />
        </Marquee>
      </div>
    </div>
  );
};

export default Ticker;

