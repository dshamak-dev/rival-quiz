import React, { useCallback, useMemo } from "react";
import { useAppContext } from "src/app/context";
import { Form } from "src/components/atoms/form";
import { FormFields } from "src/components/atoms/form/FormFields"
import { POST, POST_JSON, PUT_JSON } from "src/support/request.utils";

const sessionFormFields = [
  { id: "title", label: "title", required: true },
  {
    id: "type",
    required: true,
    label: "type",
    inputProps: {
      type: "select",
      options: [
        { value: 1, text: "Bet" },
        { value: 3, text: "Quiz" },
      ],
    },
  },
  { id: "details", label: "details" },
  { id: "tag", label: "link tag" },
  // { id: "maxUsers", label: "max users" },
  {
    id: "options",
    label: "options",
    required: true,
    inputProps: { type: "list", min: 2 },
  },
];

export const SessionForm = ({
  onEnd = null,
  onProgress = null,
  data = null,
  children,
}) => {
  const { state } = useAppContext();
  const { targetSession } = state;
  const isEditForm = useMemo(() => targetSession != null, [targetSession]);

  const handleSubmit = useCallback(
    (e, formFields) => {
      e.preventDefault();

      if (onProgress) {
        onProgress();
      }

      if (isEditForm) {
        PUT_JSON(`/api/games/${targetSession.id}`, { body: formFields })
          .then((res) => res.json())
          .then((res) => {
            if (onEnd) {
              onEnd(res);
            }
          });
      } else {
        POST_JSON("/api/games", { body: formFields })
          .then((res) => res.json())
          .then((res) => {
            if (onEnd) {
              onEnd(res);
            }
          });
      }
    },
    [isEditForm]
  );

  const defaultValues = useMemo(() => {
    return sessionFormFields.map((it) => {
      const field: any = { inputProps: {}, ...it };

      if (!targetSession || !targetSession[field.id]) {
        return field;
      }

      field.inputProps.defaultValue = targetSession[field.id];

      return field;
    });
  }, []);

  return (
    <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormFields fields={defaultValues} />
      {children}
    </Form>
  );
};
