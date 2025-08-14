import React from "react";
import { render } from "@testing-library/react";
import { AccountCard } from "@/components/ui/account-card";

describe("AccountCard", () => {
  it("renders Total Earnings heading", () => {
    const { getByText } = render(<AccountCard />);
    expect(getByText("Total Earnings")).toBeInTheDocument();
  });
});


