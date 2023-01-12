import React from "react";
import Tile, { TileProps } from "./Tile";
import styles from "./Tiles.module.scss"

type TileGroupProps = {
  tiles: TileProps[]
}

const TileGroup = ({tiles} : TileGroupProps) => {
  return (
    <section className={styles.tileGroup}>
      <div className={`${styles.content} content`}>
        { tiles.map( (tile, key) =>
          <Tile key={key} {...tile} />
        )}
      </div>
    </section>
  );
};

export default TileGroup;
