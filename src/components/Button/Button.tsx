import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Button.scss";

export type ButtonProps = {
  actionText: string,
  link: string,
  iconLeft?: IconProp,
  iconRight?: IconProp,
  colorScheme?: "primary" | "secondary" | "secondary inverted" | "primary lightHover"
}

const Button = ({actionText, link, iconLeft, iconRight, colorScheme = "primary"} : ButtonProps) => {
  return (
    <a className={`button ${colorScheme}`} href={link}>
      { iconLeft && (<FontAwesomeIcon icon={iconLeft} />)}
      <span>{ actionText }</span>
      { iconRight && (<FontAwesomeIcon icon={iconRight} />)}
    </a>
  );
};

export default Button;
