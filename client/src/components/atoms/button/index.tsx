import React from "react";
import "./style.css";
import classNames from "classnames";

export const Button: React.FC<any> = ({
  children,
  primary = false,
  secondary = false,
  className,
  ...props
}) => {
  return (
    <button
      {...props}
      className={classNames("button cursor-pointer", className, { primary, secondary })}
    >
      {children}
    </button>
  );
};
