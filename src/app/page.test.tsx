import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WelcomePage from "./page";

describe("WelcomePage", () => {
  it("shows only the primary market entry and teacher access", () => {
    render(<WelcomePage />);

    expect(screen.getByRole("link", { name: "เข้าสู่ Math Market" })).toHaveAttribute(
      "href",
      "/student/select",
    );
    expect(
      screen.getByRole("link", { name: /สำหรับคุณครู/ }),
    ).toHaveAttribute("href", "/teacher/dashboard");
    expect(screen.queryByText("เริ่มเรียน")).not.toBeInTheDocument();
    expect(screen.queryByText("น้องตะวัน")).not.toBeInTheDocument();
  });
});
