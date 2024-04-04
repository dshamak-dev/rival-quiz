import React, { useCallback, useMemo, useRef, useState } from "react";
import { Label } from "./label";
import { Button } from "src/components/atoms/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Input } from "src/components/atoms/input";
import { HiddenInput } from "./HiddenInput";

export default function ListInput({
  defaultValue,
  min,
}: {
  defaultValue?: string;
  min: number;
}) {
  const defaultOptionsValue = useMemo(() => {
    if (defaultValue) {
      return JSON.stringify(defaultValue);
    }

    return "";
  }, [defaultValue]);

  const optionRef = useRef(defaultOptionsValue);
  const [parts, setPart] = useState(
    parseOptionsValue(defaultOptionsValue, min)
  );

  const handleAddOption = useCallback((e: Event) => {
    e.preventDefault();

    setPart((prev) => prev.concat([{ text: "" }]));
  }, []);

  const handleRemove = (targetIndex: number) => {
    setPart((prev) => {
      const next = prev.filter((_, index) => index !== targetIndex);

      return validateOptionslength(next, min);
    });
  };

  const handleInput = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    setPart((prev) => {
      const _next = prev.slice();
      _next[index] = { text: event.target?.value || "" };

      const _value = _next.filter((it) => !!it.text.trim());

      optionRef.current = JSON.stringify(_value);

      return _next;
    });
  };

  return (
    <div className="relative flex flex-col gap-4 p-2 border border-black text-md">
      {parts.map((it, index) => {
        const isRequired = index < min;

        return (
          <div key={index} className="relative flex flex-col">
            <div className="flex items-center gap-2 justify-between">
              <Label id={index} required={isRequired}>
                Option {index + 1}
              </Label>
              <div
                className="flex items-center gap-1 text-[0.8em] cursor-pointer select-none hover:text-red-500"
                onClick={() => handleRemove(index)}
              >
                <b>remove</b>
                <FontAwesomeIcon icon={faTimes} />
              </div>
            </div>
            <Input
              value={it.text}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInput(e, index)
              }
              required={isRequired}
            />
          </div>
        );
      })}
      <Button onClick={handleAddOption}>add new option</Button>
      <HiddenInput name="options" value={optionRef.current} />
    </div>
  );
}

function parseOptionsValue(
  value: string,
  minLength: number
): { text: string }[] {
  let arr: any[] = [];

  try {
    if (!value) {
      arr = [];
    } else if (Array.isArray(value)) {
      arr = value;
    } else {
      arr = JSON.parse(value) || [];
    }

    if (typeof arr === "string") {
      arr = [{ text: arr }];
    }
  } catch (error) {
    arr = [];
  }
  return validateOptionslength(arr, minLength);
}

function validateOptionslength(arr: any[], minLength: number) {
  const length = arr?.length || 0;

  if (length < minLength) {
    arr = arr.concat(new Array(minLength - length).fill({ text: "" }));
  }

  return arr;
}
