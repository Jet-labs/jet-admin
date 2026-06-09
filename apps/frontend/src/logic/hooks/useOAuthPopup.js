import { useCallback, useState } from "react";
import { displayError, displaySuccess } from "../../utils/notification";
import { getOAuthUrlAPI } from "../../data/apis/oauth";

export const useOAuthPopup = ({ provider, tenantID, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);

  const startOAuth = useCallback(async (dynamicOnSuccess, dynamicOnFailure) => {
    setLoading(true);
    let popup = null;

    try {
      const url = await getOAuthUrlAPI({ provider, tenantID });

      if (!url) {
        throw new Error("Failed to retrieve OAuth URL");
      }

      // Open a popup window in the center of the screen
      const width = 600;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      popup = window.open(
        url,
        "Google OAuth",
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
      );

      if (!popup) {
        throw new Error("Popup blocked by browser. Please allow popups for this site.");
      }

      const messageListener = (event) => {
        // We can optionally verify the origin event.origin for security
        if (event.data && typeof event.data === "object") {
          if (event.data.type === "OAUTH_SUCCESS") {
            const vaultCredentialID = event.data.vaultCredentialID;
            displaySuccess("Successfully authenticated with Google!");
            if (dynamicOnSuccess) dynamicOnSuccess(vaultCredentialID);
            else if (onSuccess) onSuccess(vaultCredentialID);
            cleanup();
          } else if (event.data.type === "OAUTH_FAILURE") {
            const errorMsg = event.data.error || "Authentication failed";
            displayError(errorMsg);
            if (dynamicOnFailure) dynamicOnFailure(errorMsg);
            else if (onFailure) onFailure(errorMsg);
            cleanup();
          }
        }
      };

      const cleanup = () => {
        window.removeEventListener("message", messageListener);
        clearInterval(popupCheckInterval);
        setLoading(false);
      };

      // Register listener
      window.addEventListener("message", messageListener);

      // Check if popup is closed manually by the user
      const popupCheckInterval = setInterval(() => {
        if (!popup || popup.closed) {
          cleanup();
        }
      }, 1000);

    } catch (error) {
      setLoading(false);
      displayError(error.message || error);
      if (onFailure) onFailure(error.message || error);
    }
  }, [provider, tenantID, onSuccess, onFailure]);

  return { startOAuth, loading };
};
