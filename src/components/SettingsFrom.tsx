import { Form, Action, ActionPanel, Toast, showToast } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import { useState } from "react";

export interface SettingsFromValues {
  blockSize: string;
  prefix: string;
}

export const initialSettings: SettingsFromValues = {
  blockSize: "8",
  prefix: "img",
};

function SettingsFrom({
  settings,
  setSettings,
  reset,
}: {
  settings: SettingsFromValues;
  setSettings: (values: SettingsFromValues) => void;
  reset: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const { handleSubmit, itemProps } = useForm<SettingsFromValues>({
    initialValues: settings ?? initialSettings,
    onSubmit: (values) => {
      try {
        setSettings(values);
        showToast({
          style: Toast.Style.Success,
          title: "Settings saved.",
        });
      } catch (error) {
        setError(error as string);
      }
    },
    validation: {
      blockSize: (value) => {
        if (!value) return "Block size is required";
        const num = parseInt(value);
        if (isNaN(num) || num < 8 || num > 64) {
          return "Block size must be between 8 and 64";
        }
      },
      prefix: FormValidation.Required,
    },
  });

  // Error toast
  if (error) {
    showToast({
      style: Toast.Style.Failure,
      title: "Settings failed.",
      message: error,
    });
  }

  // Default view
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={handleSubmit} />
          <ResetSettingsAction reset={reset} />
        </ActionPanel>
      }
    >
      <Form.Description title="How to use" text={"Please set the default settings for encrypting images."} />
      <Form.TextField
        title="Block Size"
        placeholder="Enter block size (8-64)"
        {...itemProps.blockSize}
        info={`Default: 8\nFragment the image into multiple blocks and shuffle them.`}
      />
      <Form.TextField
        title="Filename Prefix"
        placeholder="Enter prefix"
        {...itemProps.prefix}
        info={`Default: img\nSet the prefix for output filename.`}
      />
    </Form>
  );
}

export default SettingsFrom;

function ResetSettingsAction({ reset }: { reset: () => void }) {
  return (
    <Action
      title="Reset Settings"
      onAction={async () => {
        reset();
        await showToast({
          style: Toast.Style.Success,
          title: "Settings reset.",
        });
      }}
    />
  );
}
