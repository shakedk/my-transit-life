/* eslint-env jest */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EditToggle from "../../../components/editToggle";

describe("EditToggle", () => {
  it("renders Edit when not in edit mode", () => {
    const setIsInEditMode = jest.fn();
    render(
      <EditToggle isInEditMode={false} setIsInEditMode={setIsInEditMode} />
    );

    expect(
      screen.getByRole("button", { name: /edit/i })
    ).toBeInTheDocument();
  });

  it("renders Finish when in edit mode", () => {
    const setIsInEditMode = jest.fn();
    render(
      <EditToggle isInEditMode={true} setIsInEditMode={setIsInEditMode} />
    );

    expect(
      screen.getByRole("button", { name: /finish/i })
    ).toBeInTheDocument();
  });

  it("calls setIsInEditMode with toggled value on click", () => {
    const setIsInEditMode = jest.fn();
    render(
      <EditToggle isInEditMode={false} setIsInEditMode={setIsInEditMode} />
    );

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    expect(setIsInEditMode).toHaveBeenCalledWith(true);
  });
});

