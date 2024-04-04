import React, { PropsWithChildren } from "react";
import { Label } from "src/components/atoms/input/label";
import { Input } from "src/components/atoms/input";

interface FieldProps extends PropsWithChildren {
  field: IFormField;
}

interface IFormField {
  id: string;
  label?: string;
  hint?: string;
  required?: boolean;
  inputProps?: object;
}

export function FormFields({ fields }: { fields: IFormField[] }) {
  if (!fields?.length) {
    return null;
  }

  return (
    <>
      {fields.map((field, index) => (
        <FormField key={index} field={field} />
      ))}
    </>
  );
}

export function FormField({ field }: FieldProps) {
  if (!field) {
    return null;
  }

  const { id, label, hint, required, inputProps } = field;

  return (
    <div className="field">
      {label ? (
        <Label id={id} required={required}>
          {label}
        </Label>
      ) : null}
      <Input
        id={id}
        name={id}
        {...inputProps}
        required={required}
        className="px-2 py-1 border border-black outline-0 w-full"
      />
    </div>
  );
}
