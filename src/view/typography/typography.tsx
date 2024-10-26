import classNames from "classnames";
import { PropsWithChildren, createElement, useMemo } from "react";

type TypographyType = "h1" | "h2" | "h3" | "paragraph";

interface IProps extends PropsWithChildren<any> {
  type?: TypographyType;
}

export function Typography(props: IProps) {
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
    className: classNames(className, props.className),
  });
}
