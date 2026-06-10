import React, { useContext } from "react";
import PropTypes from "prop-types";
import { OAuthContext } from "../context";
import { GoogleOAuthButton } from "@jet-admin/ui";

const CustomGoogleOAuthButtonControlComponent = (props) => {
  const { data, path, handleChange, label, description, errors, enabled } = props;
  const { startOAuth, loading } = useContext(OAuthContext);
  
  const hasErrors = errors && errors.length > 0;
  const isConnected = !!data;

  const handleOAuthClick = () => {
    if (startOAuth) {
      startOAuth((vaultCredentialID) => {
        handleChange(path, vaultCredentialID);
      });
    } else {
      console.error("OAuthContext missing startOAuth handler");
    }
  };

  return (
    <GoogleOAuthButton
      isConnected={isConnected}
      credentialId={data}
      onClick={handleOAuthClick}
      loading={loading}
      disabled={!enabled}
      label={label}
      description={description}
      hasErrors={hasErrors}
      errors={errors}
    />
  );
};

CustomGoogleOAuthButtonControlComponent.propTypes = {
  data: PropTypes.string,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  enabled: PropTypes.bool,
};

export const CustomGoogleOAuthButtonControl = CustomGoogleOAuthButtonControlComponent;
