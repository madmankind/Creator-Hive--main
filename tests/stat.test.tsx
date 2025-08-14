import React from "react";
import { render } from "@testing-library/react";
import { Stat } from "@/components/ui/stat";

describe("Stat", () => {
  it("shows label and value", () => {
    const { getByText } = render(<Stat label="Total" value="AED 10" />);
    expect(getByText("Total")).toBeInTheDocument();
    expect(getByText("AED 10")).toBeInTheDocument();
  });
});


