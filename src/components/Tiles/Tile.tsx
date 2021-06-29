import React from "react";
import Button, { ButtonProps } from "../Button/Button";

export type TileProps = {
  title: string,
  description: string,
  cta?: ButtonProps,
  anchor?: string
}

const Tile = ({title, description, cta, anchor} : TileProps) => {
  return (
    <div className="tile" id={anchor}>
      <h3>{title}</h3>
      <p>{description}</p>
      {cta && (<Button {...{...cta, colorScheme: "secondary"}} />)}
    </div>
  );
};

export default Tile;
