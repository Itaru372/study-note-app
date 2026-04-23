import { useMemo, useRef, useState } from 'react';
import { BookSpread } from './components/BookSpread';
import { EditorPanel } from './components/EditorPanel';
import { HomeScreen } from './components/HomeScreen';
import { useNoteStore } from './store/useNoteStore';

function App(): JSX.Element {
  const view = useNoteStore((state) => state.view);
  const notebooks = useNoteStore((state) => state.notebooks);
  const activeNotebookId = useNoteStore((state) => state.activeNotebookId);
  const revealCountMap = useNoteStore((state) => state.revealCountMap);
  const createNotebook = useNoteStore((state) => state.createNotebook);
  const renameNotebook = useNoteStore((state) => state.renameNotebook);
  const deleteNotebook = useNoteStore((state) => state.deleteNotebook);
  const openNotebook = useNoteStore((state) => state.openNotebook);
  const goHome = useNoteStore((state) => state.goHome);
  const addPage = useNoteStore((state) => state.addPage);
  const updatePage = useNoteStore((state) => state.updatePage);
  const previousSpread = useNoteStore((state) => state.previousSpread);
  const nextSpread = useNoteStore((state) => state.nextSpread);
  const selectPage = useNoteStore((state) => state.selectPage);
  const importMarkdown = useNoteStore((state) => state.importMarkdown);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeNotebook = useMemo(
    () => notebooks.find((notebook) => notebook.id === activeNotebookId),
    [notebooks, activeNotebookId]
  );

  if (view === 'home' || !activeNotebook) {
    return (
      <HomeScreen
        notebooks={notebooks}
        onCreateNotebook={createNotebook}
        onOpenNotebook={openNotebook}
        onRenameNotebook={renameNotebook}
        onDeleteNotebook={deleteNotebook}
      />
    );
  }

  const pages = activeNotebook.pages;
  const currentSpread = activeNotebook.currentSpread;
  const selectedPageId = activeNotebook.selectedPageId;
  const selectedPage = pages.find((page) => page.id === selectedPageId);

  const totalRevealCount = Object.values(revealCountMap).reduce((sum, count) => sum + count, 0);
  const spreadRevealCount = (() => {
    const leftPage = pages[currentSpread * 2];
    const rightPage = pages[currentSpread * 2 + 1];
    const spreadIds = [leftPage?.id, rightPage?.id].filter((id): id is string => Boolean(id));

    return Object.entries(revealCountMap).reduce((sum, [id, count]) => {
      return spreadIds.some((pageId) => id.startsWith(`${pageId}:`)) ? sum + count : sum;
    }, 0);
  })();

  const handleImport = async (file: File): Promise<void> => {
    const text = await file.text();
    importMarkdown(text);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">
          <h1>{activeNotebook.name}</h1>
          <p>{pages.length} ページ</p>
        </div>
        <div className="topbar__actions">
          <button type="button" className="ghost-button" onClick={goHome}>
            ホーム
          </button>
          <button type="button" className="primary-button" onClick={addPage}>
            新規ページ
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => fileInputRef.current?.click()}
          >
            Markdown読込
          </button>
          <button
            type="button"
            className={`ghost-button ${isEditorOpen ? 'is-active' : ''}`}
            onClick={() => setIsEditorOpen((open) => !open)}
          >
            {isEditorOpen ? '閲覧に戻る' : '編集'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,text/markdown,text/plain"
            className="hidden-input"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                void handleImport(file);
              }

              event.target.value = '';
            }}
          />
        </div>
        <div className="topbar__stats" aria-live="polite">
          <span className="metric-pill">見開き表示 {spreadRevealCount}</span>
          <span className="metric-pill">累計表示 {totalRevealCount}</span>
        </div>
      </header>

      <main className="workspace">
        <BookSpread
          pages={pages}
          currentSpread={currentSpread}
          selectedPageId={selectedPageId}
          onSelectPage={selectPage}
          onPrev={previousSpread}
          onNext={nextSpread}
        />
        <EditorPanel
          page={selectedPage}
          isOpen={isEditorOpen}
          onToggle={() => setIsEditorOpen((open) => !open)}
          onChangeTitle={(id, title) => updatePage(id, { title })}
          onChangeContent={(id, content) => updatePage(id, { content })}
        />
      </main>
    </div>
  );
}

export default App;
