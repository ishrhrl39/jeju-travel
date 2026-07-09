"use client";

import type { ItineraryItem } from "@/data/itinerary";
import { useCallback, useEffect, useState } from "react";

type EditableItem = {
  id: number | null;
  clientKey: string;
  title: string;
  infoText: string;
  memoText: string;
};

type ItemSaveState = "idle" | "saving" | "saved" | "error";

type ItineraryItemListProps = {
  daySlug: string;
  initialItems: ItineraryItem[];
};

function linesToText(lines?: string[]) {
  return (lines ?? []).join("\n");
}

function textToLines(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function createClientKey() {
  return `item-${crypto.randomUUID()}`;
}

function toEditableItem(item: ItineraryItem): EditableItem {
  return {
    id: item.id ?? null,
    clientKey: item.id ? `item-${item.id}` : createClientKey(),
    title: item.title,
    infoText: linesToText(item.info),
    memoText: linesToText(item.memo),
  };
}

function toItemPayload(item: EditableItem) {
  return {
    title: item.title.trim(),
    info: textToLines(item.infoText),
    memo: textToLines(item.memoText),
  };
}

function mapSavedItem(item: ItineraryItem): EditableItem {
  return {
    id: item.id ?? null,
    clientKey: item.id ? `item-${item.id}` : createClientKey(),
    title: item.title,
    infoText: linesToText(item.info),
    memoText: linesToText(item.memo),
  };
}

function createEmptyItem(): EditableItem {
  return {
    id: null,
    clientKey: createClientKey(),
    title: "",
    infoText: "",
    memoText: "",
  };
}

function getDefaultExpandedKeys(items: EditableItem[]) {
  return new Set(
    items
      .filter((item) => {
        const hasInfo = textToLines(item.infoText).length > 0;
        const hasMemo = textToLines(item.memoText).length > 0;
        return hasInfo || hasMemo;
      })
      .map((item) => item.clientKey),
  );
}

export default function ItineraryItemList({
  daySlug,
  initialItems,
}: ItineraryItemListProps) {
  const [items, setItems] = useState<EditableItem[]>(() =>
    initialItems.map(toEditableItem),
  );
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editSnapshot, setEditSnapshot] = useState<EditableItem | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() =>
    getDefaultExpandedKeys(initialItems.map(toEditableItem)),
  );
  const [itemSaveState, setItemSaveState] = useState<Record<string, ItemSaveState>>({});

  useEffect(() => {
    const nextItems = initialItems.map(toEditableItem);
    setItems(nextItems);
    setEditingKey(null);
    setEditSnapshot(null);
    setExpandedKeys(getDefaultExpandedKeys(nextItems));
  }, [initialItems]);

  const setItemState = useCallback((clientKey: string, state: ItemSaveState) => {
    setItemSaveState((current) => ({ ...current, [clientKey]: state }));
  }, []);

  function updateItem(clientKey: string, updater: (item: EditableItem) => EditableItem) {
    setItems((current) =>
      current.map((item) => (item.clientKey === clientKey ? updater(item) : item)),
    );
  }

  function dismissPendingNewItem() {
    if (!editingKey) {
      return;
    }

    const currentEditing = items.find((entry) => entry.clientKey === editingKey);

    if (currentEditing && !currentEditing.id) {
      setItems((current) => current.filter((entry) => entry.clientKey !== editingKey));
      setItemSaveState((current) => {
        const next = { ...current };
        delete next[editingKey];
        return next;
      });
    }
  }

  function startEdit(clientKey: string) {
    const item = items.find((entry) => entry.clientKey === clientKey);
    if (!item) {
      return;
    }

    dismissPendingNewItem();
    setEditSnapshot({ ...item });
    setEditingKey(clientKey);
  }

  function cancelEdit() {
    if (!editingKey) {
      return;
    }

    const item = items.find((entry) => entry.clientKey === editingKey);

    if (item && !item.id) {
      setItems((current) => current.filter((entry) => entry.clientKey !== editingKey));
    } else if (editSnapshot) {
      setItems((current) =>
        current.map((entry) =>
          entry.clientKey === editingKey ? { ...editSnapshot } : entry,
        ),
      );
    }

    setEditingKey(null);
    setEditSnapshot(null);
    setItemSaveState((current) => {
      const next = { ...current };
      delete next[editingKey];
      return next;
    });
  }

  async function saveItem(clientKey: string) {
    const item = items.find((entry) => entry.clientKey === clientKey);

    if (!item) {
      return;
    }

    if (!item.title.trim()) {
      window.alert("장소/일정 이름을 입력해 주세요.");
      return;
    }

    setItemState(clientKey, "saving");

    try {
      const payload = toItemPayload(item);
      const response = await fetch(
        item.id
          ? `/api/itinerary/${daySlug}/items/${item.id}`
          : `/api/itinerary/${daySlug}/items`,
        {
          method: item.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save item");
      }

      const saved = (await response.json()) as ItineraryItem;
      const nextItems = items.map((entry) =>
        entry.clientKey === clientKey ? mapSavedItem(saved) : entry,
      );
      setItems(nextItems);
      setExpandedKeys(getDefaultExpandedKeys(nextItems));
      setItemState(clientKey, "saved");
      setEditingKey(null);
      setEditSnapshot(null);
    } catch {
      setItemState(clientKey, "error");
    }
  }

  async function deleteItem(clientKey: string) {
    const item = items.find((entry) => entry.clientKey === clientKey);

    if (!item) {
      return;
    }

    if (!window.confirm("이 일정 항목을 삭제할까요?")) {
      return;
    }

    if (!item.id) {
      setItems((current) => current.filter((entry) => entry.clientKey !== clientKey));
      setEditingKey(null);
      setEditSnapshot(null);
      return;
    }

    setItemState(clientKey, "saving");

    try {
      const response = await fetch(`/api/itinerary/${daySlug}/items/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setItems((current) => current.filter((entry) => entry.clientKey !== clientKey));
      setItemSaveState((current) => {
        const next = { ...current };
        delete next[clientKey];
        return next;
      });
      setEditingKey(null);
      setEditSnapshot(null);
    } catch {
      setItemState(clientKey, "error");
    }
  }

  async function persistOrder(reordered: EditableItem[]) {
    const itemIds = reordered
      .map((item) => item.id)
      .filter((id): id is number => typeof id === "number");

    if (itemIds.length !== reordered.length) {
      return;
    }

    const response = await fetch(`/api/itinerary/${daySlug}/items/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to reorder items");
    }

    const saved = (await response.json()) as { items: ItineraryItem[] };
    const nextItems = saved.items.map(toEditableItem);
    setItems(nextItems);
    setExpandedKeys(getDefaultExpandedKeys(nextItems));
  }

  async function moveItem(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= items.length) {
      return;
    }

    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setItems(reordered);

    try {
      await persistOrder(reordered);
    } catch {
      setItems(initialItems.map(toEditableItem));
      window.alert("순서 저장에 실패했습니다.");
    }
  }

  function addItem() {
    const newItem = createEmptyItem();
    setItems((current) => [...current, newItem]);
    setEditSnapshot({ ...newItem });
    setEditingKey(newItem.clientKey);
  }

  function toggleExpand(clientKey: string) {
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(clientKey)) {
        next.delete(clientKey);
      } else {
        next.add(clientKey);
      }
      return next;
    });
  }

  const editingItem = editingKey
    ? (items.find((entry) => entry.clientKey === editingKey) ?? null)
    : null;
  const isEditingExisting = Boolean(editingItem?.id);

  return (
    <>
      <div className="timeline timeline-compact">
        {items.length === 0 && (
          <p className="manage-empty">등록된 일정이 없습니다. 아래에서 추가해 주세요.</p>
        )}

        {items.map((item, index) => {
          const isEditing = editingKey === item.clientKey;
          const state = itemSaveState[item.clientKey] ?? "idle";
          const statusText =
            state === "saving"
              ? "저장 중..."
              : state === "saved"
                ? "저장됨"
                : state === "error"
                  ? "오류"
                  : "";

          if (!isEditing) {
            const infoLines = textToLines(item.infoText);
            const memoLines = textToLines(item.memoText);
            const hasDetails = infoLines.length > 0 || memoLines.length > 0;
            const isExpanded = expandedKeys.has(item.clientKey);

            return (
              <article key={item.clientKey} className="item item-compact">
                <div className="card item-summary-card">
                  <div className="item-summary-row">
                    <button
                      type="button"
                      className={`item-summary-title-button${
                        hasDetails ? " item-summary-title-button-expandable" : ""
                      }`}
                      onClick={() => hasDetails && toggleExpand(item.clientKey)}
                      aria-expanded={hasDetails ? isExpanded : undefined}
                      disabled={!hasDetails}
                    >
                      <span className="item-summary-order">{index + 1}.</span>
                      <span className="item-summary-title-text">
                        {item.title.trim() || "(제목 없음)"}
                      </span>
                      {hasDetails && (
                        <span
                          className={`item-summary-chevron${
                            isExpanded ? " item-summary-chevron-open" : ""
                          }`}
                          aria-hidden
                        >
                          ▾
                        </span>
                      )}
                    </button>
                    <div className="item-summary-actions">
                      <button
                        type="button"
                        className="memo-button item-order-button"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0 || isEditingExisting}
                        aria-label="위로 이동"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="memo-button item-order-button"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === items.length - 1 || isEditingExisting}
                        aria-label="아래로 이동"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="memo-button item-edit-button"
                        onClick={() => startEdit(item.clientKey)}
                        disabled={isEditingExisting}
                      >
                        편집
                      </button>
                    </div>
                  </div>

                  {hasDetails && (
                    <div
                      className={`item-summary-details${
                        isExpanded ? " item-summary-details-open" : ""
                      }`}
                    >
                      <div className="item-summary-details-inner">
                        <div className="item-summary-details-content">
                          {infoLines.length > 0 && (
                            <div className="info">
                              {infoLines.map((line, lineIndex) => (
                                <span key={`info-${lineIndex}`}>{line}</span>
                              ))}
                            </div>
                          )}
                          {memoLines.length > 0 && (
                            <div className="memo">
                              {memoLines.map((line, lineIndex) => (
                                <span key={`memo-${lineIndex}`}>{line}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          }

          return (
            <article key={item.clientKey} className="item">
              <div className="card item-editor-card">
                <div className="item-editor-header">
                  <span className="item-editor-order">{index + 1}번째 일정 편집</span>
                  {statusText && (
                    <span className={`save-status save-status-${state}`}>
                      {statusText}
                    </span>
                  )}
                </div>

                <div className="item-editor-grid">
                  <label className="item-editor-full">
                    장소/일정
                    <input
                      value={item.title}
                      onChange={(event) =>
                        updateItem(item.clientKey, (current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      placeholder="일정 이름"
                      autoFocus
                    />
                  </label>
                  <label className="item-editor-full">
                    정보
                    <textarea
                      value={item.infoText}
                      onChange={(event) =>
                        updateItem(item.clientKey, (current) => ({
                          ...current,
                          infoText: event.target.value,
                        }))
                      }
                      placeholder="주소, 설명 등"
                    />
                  </label>
                  <label className="item-editor-full">
                    메모
                    <textarea
                      value={item.memoText}
                      onChange={(event) =>
                        updateItem(item.clientKey, (current) => ({
                          ...current,
                          memoText: event.target.value,
                        }))
                      }
                      placeholder="참고 사항"
                    />
                  </label>
                </div>

                <div className="memo-actions">
                  <button
                    type="button"
                    className="memo-button memo-button-primary"
                    onClick={() => saveItem(item.clientKey)}
                    disabled={state === "saving"}
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    className="memo-button"
                    onClick={() => deleteItem(item.clientKey)}
                    disabled={state === "saving"}
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    className="memo-button"
                    onClick={cancelEdit}
                    disabled={state === "saving"}
                  >
                    취소
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="item-list-actions">
        <button
          type="button"
          className="memo-button"
          onClick={addItem}
          disabled={editingKey !== null}
        >
          일정 추가
        </button>
      </div>
    </>
  );
}
