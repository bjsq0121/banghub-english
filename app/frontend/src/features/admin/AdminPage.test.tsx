import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminPage } from "./AdminPage";

describe("AdminPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits a structured mission payload without editing JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminPage />);

    fireEvent.change(screen.getByLabelText("미션 제목"), { target: { value: "Find the red car" } });
    fireEvent.change(screen.getByLabelText("핵심 단어"), { target: { value: "car" } });
    fireEvent.change(screen.getByLabelText("짧은 구"), { target: { value: "red car" } });
    fireEvent.change(screen.getByLabelText("짧은 문장"), { target: { value: "I see a red car." } });
    fireEvent.change(screen.getByLabelText("아빠 가이드"), {
      target: { value: "아이와 함께 빨간 장난감 자동차를 찾아보세요." }
    });
    fireEvent.change(screen.getByLabelText("활동 프롬프트"), {
      target: { value: "red car 그림을 눌러요." }
    });
    fireEvent.change(screen.getByLabelText("선택지 1"), { target: { value: "red car" } });
    fireEvent.change(screen.getByLabelText("선택지 2"), { target: { value: "not this one" } });

    fireEvent.click(screen.getByRole("button", { name: "오늘 미션으로 발행" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [, options] = fetchMock.mock.calls[0];
    const payload = JSON.parse(String(options?.body));

    expect(payload.title).toBe("Find the red car");
    expect(payload.targetWord).toBe("car");
    expect(payload.phrase).toBe("red car");
    expect(payload.sentence).toBe("I see a red car.");
    expect(payload.dadGuideKo).toBe("아이와 함께 빨간 장난감 자동차를 찾아보세요.");
    expect(payload.threeYearOld.promptKo).toBe("red car 그림을 눌러요.");
    expect(payload.threeYearOld.choices[0].label).toBe("red car");
    expect(payload.threeYearOld.choices[1].label).toBe("not this one");
    expect(payload.publishStatus).toBe("published");
    expect(payload.isToday).toBe(true);
  });
});
