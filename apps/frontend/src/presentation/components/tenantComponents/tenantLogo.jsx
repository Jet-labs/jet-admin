import React, { useState } from "react";
import brokenLogo from "../../../assets/broken-logo.png";
import PropTypes from "prop-types";

export const TenantLogo = ({ src, ...rest }) => {
  TenantLogo.propTypes = {
    src: PropTypes.string.isRequired,
  };
  const [SRC, setSrc] = useState(src);
  const fallbackImageSrc = brokenLogo;
  const handleError = () => {
    setSrc(fallbackImageSrc);
  };
  return <img src={SRC} onError={handleError} {...rest} />;
};
