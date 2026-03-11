/* eslint-env jest */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DesignControls from "../../../components/DesignControls";

function setup(overrides: Partial<React.ComponentProps<typeof DesignControls>> = {}) {
  const onChange = jest.fn();
  const onUndo = jest.fn();
  const onRedo = jest.fn();
  const props: React.ComponentProps<typeof DesignControls> = {
    value: {
      backgroundColor: "#ffffff",
      pathColor: "#000000",
      stopColor: "#ff0000",
      mapOpacity: 1,
      font: "Oswald",
      routeTitleSize: 80,
      stopFontSize: 12,
      creditFontSize: 14,
      showStopLabels: false,
    },
    canUndo: false,
    canRedo: false,
    disabled: false,
    onChange,
    onUndo,
    onRedo,
    ...overrides,
  };

  render(<DesignControls {...props} />);
  return { onChange, onUndo, onRedo };
}

describe("DesignControls", () => {
  it("renders color, font, size, and map controls", () => {
    setup();

    // Section headings
    expect(screen.getByText(/colors/i)).toBeInTheDocument();
    expect(screen.getByText(/typography/i)).toBeInTheDocument();
    expect(screen.getByText(/map & stops/i)).toBeInTheDocument();

    // Key labels (we don't rely on label->control association because of layout)
    expect(screen.getByText(/^Background$/i)).toBeInTheDocument();
    expect(screen.getByText(/route line/i)).toBeInTheDocument();
    expect(screen.getByText(/font family/i)).toBeInTheDocument();
    expect(screen.getByText(/title size/i)).toBeInTheDocument();
    expect(screen.getByText(/map opacity/i)).toBeInTheDocument();
  });

  it("calls onChange when a color input changes", () => {
    const { onChange } = setup();
    const colorInputs = document.querySelectorAll<HTMLInputElement>(
      'input[type="color"]'
    );
    // First color input corresponds to background color
    const bgColorInput = colorInputs[0];

    fireEvent.change(bgColorInput, { target: { value: "#123456" } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ backgroundColor: "#123456" })
    );
  });

  it("calls onChange when numeric inputs change and parses numbers", () => {
    const { onChange } = setup();

    const titleSizeInput = screen.getByLabelText(/title size/i);
    fireEvent.change(titleSizeInput, { target: { value: "90" } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ routeTitleSize: 90 })
    );
  });

  it("toggles showStopLabels via checkbox", () => {
    const { onChange } = setup({
      value: {
        backgroundColor: "#ffffff",
        showStopLabels: false,
      },
    });

    const checkbox = screen.getByLabelText(/show stop labels/i) as HTMLInputElement;
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ showStopLabels: true })
    );
  });

  it("calls onUndo and onRedo when buttons are clicked", () => {
    const { onUndo, onRedo } = setup({ canUndo: true, canRedo: true });

    fireEvent.click(screen.getByRole("button", { name: /undo/i }));
    fireEvent.click(screen.getByRole("button", { name: /redo/i }));

    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onRedo).toHaveBeenCalledTimes(1);
  });

  it("disables undo/redo based on canUndo/canRedo", () => {
    setup({ canUndo: false, canRedo: false });

    expect(screen.getByRole("button", { name: /undo/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /redo/i })).toBeDisabled();
  });
});

