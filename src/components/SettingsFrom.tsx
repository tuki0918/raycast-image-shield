import { useEffect } from "react";
import { Form, Action, ActionPanel, Toast, showToast } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import { useLoadingState } from "../hooks/useLoadingState";
import { SETTINGS_DEFAULT_BLOCK_SIZE, SETTINGS_DEFAULT_ENCRYPTED, SETTINGS_DEFAULT_PREFIX } from "../constraints";

export interface SettingsFromValues {
  blockSize: string;
  prefix: string;
  encrypted: boolean;
}

export const initialSettings: SettingsFromValues = {
  blockSize: SETTINGS_DEFAULT_BLOCK_SIZE,
  prefix: SETTINGS_DEFAULT_PREFIX,
  encrypted: SETTINGS_DEFAULT_ENCRYPTED,
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
  const { error, setError, handleError, setIsLoading, showErrorToast } = useLoadingState();

  useEffect(() => {
    if (error) {
      showErrorToast("Saving failed.", error);
    }
  }, [error]);

  const { handleSubmit, itemProps } = useForm<SettingsFromValues>({
    initialValues: settings ?? initialSettings,
    onSubmit: (values) => {
      try {
        setIsLoading(true);
        setError(undefined);
        setSettings(values);
        setIsLoading(false);
        showToast({
          style: Toast.Style.Success,
          title: "Settings saved.",
        });
      } catch (error) {
        handleError(error);
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
      encrypted: FormValidation.Required,
    },
  });

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
      <Form.Checkbox
        title="Encryption Type"
        label="Shuffle + Encrypt"
        {...itemProps.encrypted}
        info="If disabled, images are not encrypted, only shuffled. If enabled, images are encrypted and shuffled."
      />
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
