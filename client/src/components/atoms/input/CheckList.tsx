import {
  faCheckCircle,
  faCircle,
  faCircleCheck,
  faCircleDot,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { HiddenInput } from "src/components/atoms/input/HiddenInput";

interface Props extends PropsWithChildren {
  options: { text: string; value: any }[];
  defaultValue?: any;
  id: string;
  required?: boolean;
  disabled?: boolean;
}

export function CheckList({
  options,
  id,
  required = false,
  defaultValue = undefined,
  disabled = false
}: Props) {
  const [selected, setSelected] = useState(defaultValue);

  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue])

  return (
    <>
      <HiddenInput
        required={required}
        id={id}
        name={id}
        value={selected || ""}
      />
      {options.map(({ text, value }) => {
        const isSelection = value === selected;

        return (
          <div
            key={value}
            onClick={disabled ? null : () => setSelected(isSelection ? null : value)}
            className={classNames(
              "min-w-full border border-black flex gap-4 items-center px-4 py-2 select-none",
              {
                "cursor-pointer": !disabled,
                "contrast-[0.1]": !isSelection,
                "hover:contrast-100": !isSelection && !disabled,
                "bg-black text-white": isSelection,
              }
            )}
          >
            <span>
              <FontAwesomeIcon
                icon={isSelection ? faCircleCheck : faCircleDot}
              />
            </span>
            <span>{text}</span>
          </div>
        );
      })}
    </>
  );
}
