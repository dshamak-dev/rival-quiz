import classNames from "classnames";
import { ImgHTMLAttributes, useEffect, useState } from "react";

type Props = ImgHTMLAttributes<Element> & {
  placeholderImage?: ImgHTMLAttributes<Element>["src"];
};

export function Image({ placeholderImage, src, className, ...props }: Props) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    setImageSrc(src?.length ? src : placeholderImage || undefined);
  }, [src]);

  const handleError = () => {
    if (placeholderImage) {
      setImageSrc(placeholderImage);
    }
  };

  return (
    <img
      {...props}
      className={classNames(className)}
      src={imageSrc}
      onError={handleError}
    />
  );
}
