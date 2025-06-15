import { Form, ActionPanel, Action } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";

interface PasswordFormProps {
  onSubmit: (password: string) => void;
}

function PasswordForm({ onSubmit }: PasswordFormProps) {
  const { handleSubmit, itemProps } = useForm<{ password: string }>({
    onSubmit: (values) => onSubmit(values.password),
    validation: {
      password: FormValidation.Required,
    },
  });
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Decrypt" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.PasswordField title="Password" placeholder="Enter password" {...itemProps.password} />
    </Form>
  );
}

export default PasswordForm;
