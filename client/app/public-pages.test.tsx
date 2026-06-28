import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LandingPage from "./page";
import PlansPage from "./plans/page";
import LoginPage from "./login/page";

describe("public product journey", () => {
  it("keeps plans on a separate route and exposes the demo entry point", () => {
    render(<LandingPage />);

    expect(
      within(screen.getByRole("navigation", { name: "Public navigation" })).getByRole("link", { name: "Plans" })
    ).toHaveAttribute("href", "/plans");
    expect(screen.getByRole("link", { name: "Try live demo" })).toHaveAttribute("href", "/login#demo-accounts");
    expect(screen.queryByRole("heading", { name: "Custom pricing" })).not.toBeInTheDocument();
    expect(document.querySelector(".scrollProgress")).toBeInTheDocument();
  });

  it("renders the standalone plans page with paths back to demo and consultation", () => {
    render(<PlansPage />);

    expect(screen.getByRole("heading", { name: "A plan shaped around your property." })).toBeVisible();
    expect(screen.getAllByRole("heading", { name: "Custom pricing" })).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Try every role" })).toHaveAttribute("href", "/login#demo-accounts");
  });

  it("shows every seeded workspace role and prefills its exact credentials", () => {
    render(<LoginPage />);

    for (const role of ["Owner", "Warden", "Guard", "Staff", "Tenant", "Parent"]) {
      expect(screen.getByRole("button", { name: `Use ${role} demo account` })).toBeVisible();
    }

    fireEvent.click(screen.getByRole("button", { name: "Use Owner demo account" }));
    expect(screen.getByLabelText("Email address")).toHaveValue("owner@city-complex.hostin.local");
    expect(screen.getByLabelText("Password")).toHaveValue("city-complex@123");
    expect(screen.getByRole("status")).toHaveTextContent("Owner demo selected");
    expect(screen.getByLabelText("Dashboard colour theme")).toBeVisible();
  });
});
