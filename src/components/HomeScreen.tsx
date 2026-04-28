import { useState } from 'react';
import type { Notebook } from '../types';

interface HomeScreenProps {
  notebooks: Notebook[];
  onCreateNotebook: (name: string) => void;
  onOpenNotebook: (id: string) => void;
  onRenameNotebook: (id: string, name: string) => void;
  onDeleteNotebook: (id: string) => void;
}

const formatUpdatedAt = (value: string): string =>
  new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));

export function HomeScreen({
  notebooks,
  onCreateNotebook,
  onOpenNotebook,
  onRenameNotebook,
  onDeleteNotebook
}: HomeScreenProps): JSX.Element {
  const [newNotebookName, setNewNotebookName] = useState('');
  const [editingNotebookId, setEditingNotebookId] = useState<string | null>(null);
  const [editingNotebookName, setEditingNotebookName] = useState('');

  return (
    <div className="home-screen">
      <header className="home-header">
        <h1>Study Note</h1>
        <p>ノートブックを作成して復習を始めましょう。</p>
      </header>

      <div className="home-create">
        <input
          value={newNotebookName}
          onChange={(event) => setNewNotebookName(event.target.value)}
          placeholder="新しいノートブック名"
          aria-label="新しいノートブック名"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && newNotebookName.trim()) {
              onCreateNotebook(newNotebookName.trim());
              setNewNotebookName('');
            }
          }}
        />
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            onCreateNotebook(newNotebookName.trim());
            setNewNotebookName('');
          }}
        >
          作成して開く
        </button>
      </div>

      <section className="notebook-list" aria-label="ノートブック一覧">
        {notebooks.map((notebook) => {
          const isEditing = notebook.id === editingNotebookId;

          return (
            <div key={notebook.id} className="notebook-item">
              <div className="notebook-item__main">
                {isEditing ? (
                  <input
                    value={editingNotebookName}
                    onChange={(event) => setEditingNotebookName(event.target.value)}
                    className="notebook-item__title-input"
                    aria-label="ノートブック名を編集"
                    autoFocus
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        onRenameNotebook(notebook.id, editingNotebookName);
                        setEditingNotebookId(null);
                        setEditingNotebookName('');
                      } else if (event.key === 'Escape') {
                        setEditingNotebookId(null);
                        setEditingNotebookName('');
                      }
                    }}
                  />
                ) : (
                  <p className="notebook-item__name">{notebook.name}</p>
                )}
                <p className="notebook-item__meta">
                  {notebook.pages.length} ページ　更新: {formatUpdatedAt(notebook.updatedAt)}
                </p>
              </div>
              <div className="notebook-item__actions">
                {!isEditing && (
                  <>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => onOpenNotebook(notebook.id)}
                    >
                      開く
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => {
                        setEditingNotebookId(notebook.id);
                        setEditingNotebookName(notebook.name);
                      }}
                    >
                      名前変更
                    </button>
                    <button
                      type="button"
                      className="ghost-button danger"
                      onClick={() => {
                        const confirmed = window.confirm(`「${notebook.name}」を削除しますか？`);

                        if (confirmed) {
                          onDeleteNotebook(notebook.id);
                        }
                      }}
                    >
                      削除
                    </button>
                  </>
                )}
                {isEditing && (
                  <>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => {
                        onRenameNotebook(notebook.id, editingNotebookName);
                        setEditingNotebookId(null);
                        setEditingNotebookName('');
                      }}
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => {
                        setEditingNotebookId(null);
                        setEditingNotebookName('');
                      }}
                    >
                      キャンセル
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
