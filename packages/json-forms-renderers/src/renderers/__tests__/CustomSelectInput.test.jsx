import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomSelectInput } from "../CustomSelectInput";
import "@testing-library/jest-dom";

// Mock @jet-admin/ui to mock SearchSelect since it might have external dependencies
jest.mock("@jet-admin/ui", () => {
  const React = require("react");
  return {
    Label: ({ children, htmlFor, className }) => (
      <label htmlFor={htmlFor} className={className}>{children}</label>
    ),
    Button: ({ children, onClick, disabled, title }) => (
      <button onClick={onClick} disabled={disabled} title={title}>{children}</button>
    ),
    SearchSelect: ({ value, onChange, options, placeholder, disabled }) => (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid="mock-search-select"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  };
});

describe("CustomSelectInput Component", () => {
  const defaultProps = {
    data: "val2",
    path: "mySelectField",
    handleChange: jest.fn(),
    label: "My Dropdown",
    description: "Choose a value from the dropdown",
    errors: [],
    schema: {
      type: "string",
      enum: ["val1", "val2", "val3"],
    },
    uischema: {
      type: "Control",
      options: {
        placeholder: "Choose option...",
        enumLabels: [
          { value: "val1", label: "Value One" },
          { value: "val2", label: "Value Two" },
          { value: "val3", label: "Value Three" },
        ]
      }
    },
    enabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with the correct label and options", () => {
    render(<CustomSelectInput {...defaultProps} />);

    // Verify label rendering
    expect(screen.getByText("My Dropdown")).toBeInTheDocument();

    // Verify options are mapped with custom labels
    const select = screen.getByTestId("mock-search-select");
    expect(select).toBeInTheDocument();
    expect(select.value).toBe("val2");

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(4); // 1 placeholder + 3 enum values
    expect(options[1].textContent).toBe("Value One");
    expect(options[2].textContent).toBe("Value Two");
  });

  it("calls handleChange when an option is selected", () => {
    render(<CustomSelectInput {...defaultProps} />);

    const select = screen.getByTestId("mock-search-select");
    fireEvent.change(select, { target: { value: "val3" } });

    expect(defaultProps.handleChange).toHaveBeenCalledWith("mySelectField", "val3");
  });

  it("renders error state when errors are present", () => {
    const errorProps = {
      ...defaultProps,
      errors: ["Field is required"],
    };
    render(<CustomSelectInput {...errorProps} />);

    expect(screen.getByText("Field is required")).toBeInTheDocument();
  });
});
