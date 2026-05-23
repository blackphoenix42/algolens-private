// src/tests/unit/AuthoringEditor.test.tsx
// Side-effect import: initialises the i18next instance used by useI18n.
import "@/i18n";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AuthoringEditor from "@/components/authoring/AuthoringEditor";

describe("<AuthoringEditor />", () => {
  it("renders accessible labels for source and input", () => {
    render(<AuthoringEditor />);
    expect(
      screen.getByRole("region", { name: /authoring editor/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/source code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/input/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /run/i })).toBeInTheDocument();
    // Status uses role=status with aria-live=polite for screen readers.
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("compiles and runs the default sample, reporting frame count", () => {
    render(<AuthoringEditor />);
    fireEvent.click(screen.getByRole("button", { name: /run/i }));
    const status = screen.getByRole("status");
    expect(status.textContent).toMatch(/frame/i);
    expect(status.textContent).not.toMatch(/error/i);
  });

  it("surfaces JSON parse errors in the status region", () => {
    render(<AuthoringEditor initialInputJson="not-json" />);
    fireEvent.click(screen.getByRole("button", { name: /run/i }));
    const status = screen.getByRole("status");
    expect(status.textContent?.toLowerCase()).toContain("error");
  });

  it("surfaces runtime errors thrown from authored code", () => {
    const buggy = `function run() { throw new Error("boom"); }`;
    render(<AuthoringEditor initialSource={buggy} initialInputJson="0" />);
    fireEvent.click(screen.getByRole("button", { name: /run/i }));
    expect(screen.getByRole("status").textContent).toMatch(/boom/);
  });

  it("invokes onRun with the produced frames", () => {
    const calls: number[] = [];
    render(
      <AuthoringEditor
        initialSource={`function run(input, em){ em.snapshot([1,2]); em.snapshot([3,4]); }`}
        onRun={(r) => calls.push(r.frames.length)}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /run/i }));
    expect(calls).toEqual([2]);
  });
});
