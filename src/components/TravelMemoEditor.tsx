"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SaveState = "idle" | "loading" | "saving" | "saved" | "error";

type TravelMemoEditorProps = {
  daySlug: string;
  dayNumber: number;
  placeholder: string;
  accentColor?: string;
  autoSave?: boolean;
};

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function TravelMemoEditor({
  daySlug,
  dayNumber,
  placeholder,
  accentColor,
  autoSave = true,
}: TravelMemoEditorProps) {
  const [memo, setMemo] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const skipNextSave = useRef(true);
  const isLoadingRef = useRef(true);

  const persistMemo = useCallback(
    async (content: string) => {
      setSaveState("saving");

      try {
        const response = await fetch(`/api/memos/${daySlug}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error("Failed to save memo");
        }

        const data = (await response.json()) as {
          content: string;
          updatedAt: string;
        };

        skipNextSave.current = true;
        setMemo(data.content);
        setUpdatedAt(data.updatedAt);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    },
    [daySlug],
  );

  const loadMemo = useCallback(async () => {
    isLoadingRef.current = true;
    setSaveState("loading");

    try {
      const response = await fetch(`/api/memos/${daySlug}`);

      if (!response.ok) {
        throw new Error("Failed to load memo");
      }

      const data = (await response.json()) as {
        content: string;
        updatedAt: string | null;
      };

      skipNextSave.current = true;
      setMemo(data.content);
      setUpdatedAt(data.updatedAt);
      setSaveState("idle");
    } catch {
      setSaveState("error");
    } finally {
      isLoadingRef.current = false;
    }
  }, [daySlug]);

  useEffect(() => {
    loadMemo();
  }, [loadMemo]);

  useEffect(() => {
    if (!autoSave || isLoadingRef.current) {
      return;
    }

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      persistMemo(memo);
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoSave, daySlug, memo, persistMemo]);

  async function handleDelete() {
    if (!window.confirm("이 날짜의 여행 메모를 삭제할까요?")) {
      return;
    }

    setSaveState("saving");

    try {
      const response = await fetch(`/api/memos/${daySlug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete memo");
      }

      skipNextSave.current = true;
      setMemo("");
      setUpdatedAt(null);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  const saveMessage =
    saveState === "loading"
      ? "불러오는 중..."
      : saveState === "saving"
        ? "저장 중..."
        : saveState === "saved"
          ? "저장됨"
          : saveState === "error"
            ? "오류 발생"
            : updatedAt
              ? `마지막 수정: ${formatUpdatedAt(updatedAt)}`
              : "메모 없음";

  return (
    <section
      className="summary"
      style={accentColor ? ({ "--accent": accentColor } as React.CSSProperties) : undefined}
    >
      <div className="summary-header">
        <h2>📝 {dayNumber}일차 여행 메모</h2>
        <span className={`save-status save-status-${saveState}`}>{saveMessage}</span>
      </div>

      <textarea
        value={memo}
        onChange={(event) => {
          setSaveState("idle");
          setMemo(event.target.value);
        }}
        placeholder={placeholder}
        aria-label={`${dayNumber}일차 여행 메모`}
        disabled={saveState === "loading" || saveState === "saving"}
      />

      <div className="memo-actions">
        <button
          type="button"
          className="memo-button memo-button-primary"
          onClick={() => persistMemo(memo)}
          disabled={saveState === "loading" || saveState === "saving"}
        >
          저장
        </button>
        <button
          type="button"
          className="memo-button"
          onClick={handleDelete}
          disabled={saveState === "loading" || saveState === "saving" || !memo}
        >
          삭제
        </button>
        {saveState === "error" && (
          <button type="button" className="memo-button" onClick={loadMemo}>
            다시 불러오기
          </button>
        )}
      </div>
    </section>
  );
}
