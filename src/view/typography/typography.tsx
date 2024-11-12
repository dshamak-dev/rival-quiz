import classNames from "classnames";
import { PropsWithChildren, createElement, useMemo } from "react";

type TypographyType = "h1" | "h2" | "h3" | "paragraph";

type TypographySize = "small" | "medium" | "large" | "huge";

interface IProps extends PropsWithChildren<any> {
  type?: TypographyType;
  size?: TypographySize;
}

export function Typography(props: IProps) {
  const sizeClassName = useMemo(() => {
    switch (props.size) {
      case "small":
        return "text-sm";
      case "medium":
        return "text-base";
      case "large":
        return "text-lg";
      case "huge":
        return "text-xl";
      default:
        return "";
    }
  }, [props.size]);

  const { tag, className } = useMemo(() => {
    switch (props.type) {
      case 'h1': {
        return { tag: "h1", className: "text-3xl font-bold" };
      }
      case 'h2': {
        return { tag: "h2", className: "text-xl font-semibold" };
      }
      case 'h3': {
        return { tag: "h3", className: "text-lg" };
      }
      case 'paragraph': {
        return { tag: "p", className: "text-base" };
      }
      default: {
        return { tag: "div", className: "text-base" };
      }
    }
  }, [props.type]);

  return createElement(tag, {
    ...props,
    className: classNames(className, props.className, sizeClassName),
  });
}
