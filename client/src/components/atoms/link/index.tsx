import React from 'react';
import { Link } from "react-router-dom";
import "./style.css";
import classNames from 'classnames';

export const NavLink = (props) => {
  return <Link {...props} className={classNames('link', props?.className)} />
};