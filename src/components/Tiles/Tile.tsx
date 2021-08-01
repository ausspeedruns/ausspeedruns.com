import React from "react";
import Button, { ButtonProps } from "../Button/Button";

export type TileProps = {
  title: string,
  description: string,
  ctas?: ButtonProps[],
  anchor?: string,
  colorScheme?: string
}

const Tile = ({title, description, ctas, anchor} : TileProps) => {
  console.log(title, ctas)
  return (
    <div className="tile" id={anchor}>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="ctas">
        {ctas && ctas.map( (cta: ButtonProps) => {
          return (<Button {...{...cta, colorScheme: cta.colorScheme || "secondary"}} />)
        })}
      </div>
    </div>
  );
};

export default Tile;
