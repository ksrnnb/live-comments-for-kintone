import { describe, it, expect } from "vitest";
import { extractCount, buildSignal, isVisible, findClickTarget } from "./lib.js";

const make = (text: string): HTMLElement => {
  const element = document.createElement("div");
  element.textContent = text;
  return element;
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
    const element = document.createElement("div");
    Object.assign(element.style, style);
    document.body.appendChild(element);
    return element;
  };

  const stubRect = (element: HTMLElement, width: number, height: number): void => {
    element.getBoundingClientRect = () =>
      ({
        width,
        height,
        top: 0,
        left: 0,
        right: width,
        bottom: height,
        x: 0,
        y: 0,
        toJSON: () => "",
      }) as DOMRect;
  };

  it("returns false for display:none", () => {
    const element = mount({ display: "none" });
    expect(isVisible(element)).toBe(false);
  });

  it("returns false for visibility:hidden", () => {
    const element = mount({ visibility: "hidden" });
    expect(isVisible(element)).toBe(false);
  });

  it("returns false for opacity:0", () => {
    const element = mount({ opacity: "0" });
    expect(isVisible(element)).toBe(false);
  });

  it("returns true for visible element with non-zero rect", () => {
    const element = mount({});
    stubRect(element, 100, 20);
    expect(isVisible(element)).toBe(true);
  });

  it("returns false when rect is 0x0 (ancestor hidden case)", () => {
    const element = mount({});
    stubRect(element, 0, 0);
    expect(isVisible(element)).toBe(false);
  });
});

describe("findClickTarget", () => {
  const stubVisible = (element: HTMLElement): void => {
    element.getBoundingClientRect = () =>
      ({ width: 100, height: 20, top: 0, left: 0, right: 100, bottom: 20, x: 0, y: 0, toJSON: () => "" }) as DOMRect;
  };

  it("returns a descendant matching the selector", () => {
    const container = document.createElement("div");
    const button = document.createElement("button");
    stubVisible(button);
    container.append(button);
    document.body.append(container);
    expect(findClickTarget(container, "button")).toBe(button);
  });

  it("returns the container itself when selector is empty (self-click)", () => {
    const button = document.createElement("button");
    stubVisible(button);
    document.body.append(button);
    expect(findClickTarget(button, "")).toBe(button);
  });

  it("returns null when the target is not visible", () => {
    const button = document.createElement("button");
    button.style.display = "none";
    document.body.append(button);
    expect(findClickTarget(button, "")).toBeNull();
  });

  it("matches the new thread notification button via title attribute", () => {
    document.body.innerHTML =
      '<div class="_container_p3h63_1"><button class="sc-hwnnMa bRRZbO" type="button" title="1件の新着コメントがあります"><span class="bRRZbO__label">1件の新着コメントがあります</span></button></div>';
    const button = document.querySelector<HTMLElement>('button[title*="新着コメントがあります"]')!;
    stubVisible(button);
    expect(findClickTarget(button, "")).toBe(button);
    expect(buildSignal(button)).toBe("c:1");
  });
});
