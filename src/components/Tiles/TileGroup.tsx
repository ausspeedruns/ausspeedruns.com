import React from "react";
import Tile, { TileProps } from "./Tile";
import "./Tiles.scss"

type TileGroupProps = {
  tiles: TileProps[]
}

const TileGroup = ({tiles} : TileGroupProps) => {
  return (
    <div className="tileGroup">
      <div className="content">
        { tiles.map( (tile) => 
          <Tile {...tile} />
        )}
      </div>
    </div>
  );
};

export default TileGroup;