import { useEffect, useState } from "react";
import "./deleting_post.css";

type DeleteOverlayProps = {
  cancel: () => void;
  deleteAccount: () => void;
};

export function DeletingPost({
  cancel,
  deleteAccount,
}: DeleteOverlayProps) {
  const [timer, setTimer] = useState(5);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="delete-overlay">
      <div className="delete-modal">

        <div className="delete-warning-icon">
          !
        </div>

        <h1 className="delete-title">
          WARNING
        </h1>

        <p className="delete-message">
          Are you{" "}
          <strong>Sure</strong>{" "}
          you want to delete your account?
        </p>

        <p className="delete-description">
          This action cannot be undone. All your account data will be
          permanently deleted.
        </p>

        <div className="delete-actions">

          <button
            type="button"
            className="delete-cancel-button"
            onClick={cancel}
          >
            Cancel
          </button>

          {timer > 0 ? (
            <button
              type="button"
              className="delete-confirm-button delete-confirm-disabled"
              disabled
            >
              Delete
              <span className="delete-timer">
                {timer}
              </span>
            </button>
          ) : (
            <button
              type="button"
              className="delete-confirm-button"
              onClick={deleteAccount}
            >
              Delete
            </button>
          )}

        </div>
      </div>
    </div>
  );
}