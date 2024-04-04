import React, { useMemo } from "react";
import "./style.css";
import classNames from "classnames";
import Select from "./select";
import ListInput from "./listInput";

export function Input({ className, type, ...props }: any) {
  switch (type) {
    case 'list': {
      return <ListInput {...props} className={className} />
    }
    case 'select': {
      return <Select {...props} className={className} />
    }
  }

  return (
    <input
      type={type}
      name={props.id}
      {...props}
      className={classNames(
        "px-2 py-1 border border-black outline-0 w-full",
        className
      )}
    />
  );
}
