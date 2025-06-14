import { Form, ActionPanel, Action } from "@raycast/api";
import { useState } from "react";

interface PasswordFormProps {
  onSubmit: (password: string) => void;
}

function PasswordForm({ onSubmit }: PasswordFormProps) {
  const [password, setPassword] = useState("");
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Decrypt" onSubmit={() => onSubmit(password)} />
        </ActionPanel>
      }
    >
      <Form.PasswordField
        id="password"
        title="Password"
        value={password}
        onChange={setPassword}
        placeholder="Enter password"
      />
    </Form>
  );
}

export default PasswordForm;
