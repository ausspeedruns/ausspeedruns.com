import React from "react";
import Button, { ButtonProps } from "../Button/Button";

export type TileProps = {
  title: string,
  description: string,
  cta?: ButtonProps
}

const Tile = ({title, description, cta} : TileProps) => {
  return (
    <div className="tile">
      <h3>{title}</h3>
      <p>{description}</p>
      {cta && (<Button {...cta} />)}
    </div>
  );
};

export default Tile;
