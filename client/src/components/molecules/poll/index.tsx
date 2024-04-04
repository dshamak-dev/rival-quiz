import {
  faCircleCheck,
  faCircleDot,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";

export function Poll({ options, selected, answer = null }) {
  const hasAnswer = answer != null;

  return options.map(({ text, value }) => {
    const isSelection = value === selected;
    const isCorrect = value === answer;

    return (
      <div
        key={value}
        className={classNames(
          "min-w-full border border-black flex gap-4 items-center px-4 py-2 select-none",
          {
            "bg-black text-white": isSelection && !hasAnswer,
            "bg-cyan-600 text-white": hasAnswer && isSelection && isCorrect,
            "bg-rose-600 text-white": hasAnswer && isSelection && !isCorrect,
          }
        )}
      >
        <span>
          <FontAwesomeIcon
            icon={
              hasAnswer
                ? isCorrect
                  ? faCircleCheck
                  : faCircleXmark
                : isSelection
                ? faCircleCheck
                : faCircleDot
            }
          />
        </span>
        <div>{text}</div>
      </div>
    );
  });
}
