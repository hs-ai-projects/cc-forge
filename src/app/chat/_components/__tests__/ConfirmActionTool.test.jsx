// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ConfirmActionTool from "../ConfirmActionTool";

afterEach(() => {
  cleanup();
});

const inputAvailablePart = {
  type: "tool-confirmAction",
  toolCallId: "call_1",
  state: "input-available",
  input: { title: "删除项目", description: "此操作不可逆" },
};

const outputAvailablePart = {
  type: "tool-confirmAction",
  toolCallId: "call_1",
  state: "output-available",
  input: { title: "删除项目", description: "此操作不可逆" },
  output: { confirmed: true },
};

describe("ConfirmActionTool", () => {
  it("renders title and description in input-available state", () => {
    render(<ConfirmActionTool part={inputAvailablePart} addToolOutput={vi.fn()} />);
    expect(screen.getByText("删除项目")).toBeDefined();
    expect(screen.getByText("此操作不可逆")).toBeDefined();
  });

  it("clicking 确认 calls addToolOutput with confirmed=true", () => {
    const addToolOutput = vi.fn();
    render(<ConfirmActionTool part={inputAvailablePart} addToolOutput={addToolOutput} />);
    fireEvent.click(screen.getByText("确认"));
    expect(addToolOutput).toHaveBeenCalledWith({
      tool: "confirmAction",
      toolCallId: "call_1",
      output: { confirmed: true },
    });
  });

  it("clicking 取消 calls addToolOutput with confirmed=false", () => {
    const addToolOutput = vi.fn();
    render(<ConfirmActionTool part={inputAvailablePart} addToolOutput={addToolOutput} />);
    fireEvent.click(screen.getByText("取消"));
    expect(addToolOutput).toHaveBeenCalledWith({
      tool: "confirmAction",
      toolCallId: "call_1",
      output: { confirmed: false },
    });
  });

  it("renders confirmed status in output-available state", () => {
    render(<ConfirmActionTool part={outputAvailablePart} addToolOutput={vi.fn()} />);
    expect(screen.getByText(/已确认/)).toBeDefined();
  });

  it("renders cancelled status when output.confirmed=false", () => {
    const part = { ...outputAvailablePart, output: { confirmed: false } };
    render(<ConfirmActionTool part={part} addToolOutput={vi.fn()} />);
    expect(screen.getByText(/已取消/)).toBeDefined();
  });
});
