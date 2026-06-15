import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchSelect } from "../search-select";
import "@testing-library/jest-dom";

const options = [
  { value: "opt1", label: "Option One" },
  { value: "opt2", label: "Option Two" },
  { value: "opt3", label: "Another Option" },
];

describe("SearchSelect Component", () => {
  it("renders trigger button with placeholder when no value is selected", () => {
    render(
      <SearchSelect
        options={options}
        value=""
        onChange={jest.fn()}
        placeholder="Choose option"
      />
    );
    expect(screen.getByText("Choose option")).toBeInTheDocument();
  });

  it("renders trigger button with label of selected option", () => {
    render(
      <SearchSelect
        options={options}
        value="opt2"
        onChange={jest.fn()}
        placeholder="Choose option"
      />
    );
    expect(screen.getByText("Option Two")).toBeInTheDocument();
  });

  it("filters options locally based on search input", async () => {
    render(
      <SearchSelect
        options={options}
        value=""
        onChange={jest.fn()}
        placeholder="Choose option"
        searchPlaceholder="Type to search..."
      />
    );

    // Open popover
    fireEvent.click(screen.getByRole("button"));

    // Find and type in search input
    const searchInput = screen.getByPlaceholderText("Type to search...");
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "Another" } });

    // Assert filtered options
    expect(screen.getByText("Another Option")).toBeInTheDocument();
    expect(screen.queryByText("Option One")).not.toBeInTheDocument();
    expect(screen.queryByText("Option Two")).not.toBeInTheDocument();
  });

  it("calls onChange when an option is clicked", () => {
    const handleChange = jest.fn();
    render(
      <SearchSelect
        options={options}
        value=""
        onChange={handleChange}
        placeholder="Choose option"
      />
    );

    // Open popover
    fireEvent.click(screen.getByRole("button"));

    // Click option
    fireEvent.click(screen.getByText("Option One"));

    expect(handleChange).toHaveBeenCalledWith("opt1");
  });
});
