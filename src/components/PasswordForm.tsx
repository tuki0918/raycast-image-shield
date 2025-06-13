import { Form, ActionPanel, Action } from "@raycast/api";
import { useState } from "react";

function PasswordForm({ onSubmit }: { onSubmit: (password: string) => void }) {
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
        title="Secret Key"
        value={password}
        onChange={setPassword}
        placeholder="Enter secret key"
      />
    </Form>
  );
}

export default PasswordForm;
