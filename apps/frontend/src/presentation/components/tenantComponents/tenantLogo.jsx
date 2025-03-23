import { useState } from "react";
import brokenLogo from "../../../assets/broken-logo.png"
export const TenantLogo = (props) => {
  const { src, ...rest } = props;
  const [SRC, setSrc] = useState(src);
  const fallbackImageSrc = brokenLogo;
  const handleError = () => {
    setSrc(fallbackImageSrc);
  };
  return <img src={SRC} onError={handleError} {...rest} />;
};

