import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/web/App";

describe("App UI Render Test", () => {
  it("renders App without crashing", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(container.innerHTML).toContain("Vita");
  });
});

