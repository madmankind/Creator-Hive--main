import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { TiltCard } from "@/components/primitives/TiltCard";

describe("TiltCard reduced motion", () => {
  const matchMediaMock = (matches: boolean) =>
    vi.fn().mockImplementation((query: string) => ({ matches, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() } as any));

  beforeEach(() => {
    // @ts-expect-error jsdom
    window.matchMedia = matchMediaMock(true);
  });

  it("renders without applying inline transform when reduced motion", () => {
    const { getByTestId } = render(<div data-testid="wrap"><TiltCard>content</TiltCard></div>);
    const el = getByTestId("wrap").firstChild as HTMLElement;
    expect(el).toBeTruthy();
  });
});

