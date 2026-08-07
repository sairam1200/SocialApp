"use client";

import DialogContainer from "@/components/dialog/DialogContainer";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  username: string;
  onConfirm: () => void;
};

export default function UnblockAccDialog({ open, onClose, username, onConfirm }: Props) {
  return (
    <DialogContainer
      open={open}
      onClose={onClose}
      title={`Unblock @${username}?`}
      maxWidthClass="max-w-2xl"
      footer={
        <div className="flex justify-end gap-4">
          <Button type="button" label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            type="button"
            label="Done"
            onClick={() => {
              /**
               * TEMP (NO API):
               * Just calls onConfirm (which updates local state in parent).
               * Later replace with API call to unblock the account first.
               */
              onConfirm();
            }}
          />
        </div>
      }
    >
      {/* No extra body content needed for this confirm dialog */}
      <div>
        By unblocking the account, their content will become visible to you. Are you sure you want to unblock the account?
      </div>
    </DialogContainer>
  );
}
