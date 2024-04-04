import React from "react";
import classNames from "classnames";
import { ComponentProps, useMemo } from "react";
// import { useFormStatus } from 'react-dom';

interface Props extends ComponentProps<any> {
  placeholder?: string;
  options: { value: any; text: string }[];
}

export default function Select({
  placeholder,
  options,
  className,
  hideLabel = false,
  disabled,
  ...other
}: Props) {
  // const { pending } = useFormStatus();

  const isDisabled = useMemo(() => {
    return disabled;
  }, [disabled]);

  return (
    <select
      name={other.id}
      {...other}
      disabled={isDisabled}
      className={classNames(
        "primary block border",
        {
          "brightness-90 pointer-events-none": isDisabled,
        },
        className
      )}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map(({ text, value }) => {
        return (
          <option key={value} value={value}>
            {text}
          </option>
        );
      })}
    </select>
  );
}
