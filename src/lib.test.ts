import { describe, it, expect } from "vitest";
import { extractCount, buildSignal, isVisible } from "./lib.js";

const make = (text: string): HTMLElement => {
  const el = document.createElement("div");
  el.textContent = text;
  return el;
};

describe("extractCount", () => {
  it("returns null for empty content", () => {
    expect(extractCount(document.createElement("div"))).toBeNull();
  });

  it("extracts count from Japanese label", () => {
    expect(extractCount(make("12件の新着コメントがあります"))).toBe(12);
  });

  it("extracts count from English label", () => {
    expect(extractCount(make("You have more than 3 new comments"))).toBe(3);
  });

  it("returns null when count is 0", () => {
    expect(extractCount(make("0件のコメント"))).toBeNull();
  });

  it("returns null when no digits in text", () => {
    expect(extractCount(make("コメントを表示"))).toBeNull();
  });
});

describe("buildSignal", () => {
  it("uses count signal when number present", () => {
    expect(buildSignal(make("5 new comments"))).toBe("c:5");
  });

  it("falls back to trimmed text signal when no number", () => {
    expect(buildSignal(make("  See new comments  "))).toBe("t:See new comments");
  });

  it("yields same signal across languages with same count", () => {
    expect(buildSignal(make("2件の新着"))).toBe(buildSignal(make("2 new")));
  });

  it("yields different signals for different counts", () => {
    expect(buildSignal(make("2件"))).not.toBe(buildSignal(make("3件")));
  });
});

describe("isVisible", () => {
  const mount = (style: Partial<CSSStyleDeclaration>): HTMLElement => {
    const el = document.createElement("div");
    Object.assign(el.style, style);
    document.body.appendChild(el);
    return el;
  };

  const stubRect = (el: HTMLElement, w: number, h: number): void => {
    el.getBoundingClientRect = () =>
      ({ width: w, height: h, top: 0, left: 0, right: w, bottom: h, x: 0, y: 0, toJSON: () => "" }) as DOMRect;
  };

  it("returns false for display:none", () => {
    const el = mount({ display: "none" });
    expect(isVisible(el)).toBe(false);
  });

  it("returns false for visibility:hidden", () => {
    const el = mount({ visibility: "hidden" });
    expect(isVisible(el)).toBe(false);
  });

  it("returns false for opacity:0", () => {
    const el = mount({ opacity: "0" });
    expect(isVisible(el)).toBe(false);
  });

  it("returns true for visible element with non-zero rect", () => {
    const el = mount({});
    stubRect(el, 100, 20);
    expect(isVisible(el)).toBe(true);
  });

  it("returns false when rect is 0x0 (ancestor hidden case)", () => {
    const el = mount({});
    stubRect(el, 0, 0);
    expect(isVisible(el)).toBe(false);
  });
});
