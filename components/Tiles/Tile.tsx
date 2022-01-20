import React from "react";
import Button, { ButtonProps } from "../Button/Button";
import styles from './Tiles.module.scss';

export type TileProps = {
  title: string,
  description: string,
  ctas?: ButtonProps[],
  anchor?: string,
  colorScheme?: string
}

const Tile = ({title, description, ctas, anchor} : TileProps) => {
  return (
    <div className={styles.tile} id={anchor}>
      <h3>{title}</h3>
      <p>{description}</p><div className={styles.ctas}>
        {ctas?.map( (cta: ButtonProps, i) => {
          return (<Button key={i} {...{...cta, colorScheme: cta.colorScheme || "secondary"}} />)
        })}
      </div>
    </div>
  );
};

export default Tile;
