import React from "react";
import { SegmentedControl } from "./SegmentedControl";

const DEFAULT_SIZES = [
  { value: "sm", label: "S", title: "Small" },
  { value: "default", label: "M", title: "Default" },
  { value: "lg", label: "L", title: "Large" },
];

/**
 * SizeField — consistent three-step control sizing. Maps to the repo's
 * existing sm/default/lg contract (28 / 32 / 40px).
 */
export const SizeField = ({ value = "default", onChange, options = DEFAULT_SIZES, label = "Size", className }) => (
  <SegmentedControl
    value={value}
    onChange={onChange}
    options={options}
    ariaLabel={label}
    className={className}
  />
);

export default SizeField;
