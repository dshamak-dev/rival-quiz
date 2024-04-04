import React, { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  className?: string;
  onSubmit?: (e, fields) => void;
}

export const Form: React.FC<Props> = ({ onSubmit, children = null, ...props }) => {
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData: any = new FormData(e.target);
    const formFields = {};

    for (let [key, value] of formData) {
      formFields[key] = value;
    }

    onSubmit(e, formFields);
  };

  return (
    <form {...props} onSubmit={handleSubmit}>
      {children}
    </form>
  );
};
