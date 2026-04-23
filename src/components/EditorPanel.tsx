import type { NotePage } from '../types';

interface EditorPanelProps {
  page: NotePage | undefined;
  isOpen: boolean;
  onToggle: () => void;
  onChangeTitle: (id: string, title: string) => void;
  onChangeContent: (id: string, content: string) => void;
}

export function EditorPanel({
  page,
  isOpen,
  onToggle,
  onChangeTitle,
  onChangeContent
}: EditorPanelProps): JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  return (
    <section className="editor-overlay is-open">
      <button type="button" className="editor-overlay__backdrop" onClick={onToggle} />
      <aside className="editor-panel is-open" role="dialog" aria-modal="true" aria-label="Editor">
        <header className="editor-panel__header">
          <h2>Editor</h2>
          <button type="button" className="ghost-button editor-close" onClick={onToggle}>
            閉じる
          </button>
        </header>

        {page && (
          <div className="editor-panel__body">
            <label className="editor-field">
              <span>タイトル</span>
              <input
                value={page.title}
                onChange={(event) => onChangeTitle(page.id, event.target.value)}
                placeholder="ページタイトル"
              />
            </label>
            <label className="editor-field">
              <span>Markdown</span>
              <textarea
                value={page.content}
                onChange={(event) => onChangeContent(page.id, event.target.value)}
                spellCheck={false}
              />
            </label>
            <p className="editor-help">ページを分けて import したい場合は区切りに --- を使用します。</p>
          </div>
        )}

        {!page && <div className="editor-panel__empty">見開き内のページを選択すると編集できます。</div>}
      </aside>
    </section>
  );
}
