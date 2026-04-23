import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppView, NotePage, Notebook } from '../types';

interface NoteState {
  view: AppView;
  notebooks: Notebook[];
  activeNotebookId: string | null;
  revealedMap: Record<string, boolean>;
  revealCountMap: Record<string, number>;
  createNotebook: (name: string) => void;
  renameNotebook: (id: string, name: string) => void;
  deleteNotebook: (id: string) => void;
  openNotebook: (id: string) => void;
  goHome: () => void;
  addPage: () => void;
  updatePage: (id: string, patch: Partial<Pick<NotePage, 'title' | 'content'>>) => void;
  selectPage: (id: string) => void;
  previousSpread: () => void;
  nextSpread: () => void;
  importMarkdown: (markdown: string) => void;
  toggleHidden: (hiddenId: string) => void;
}

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getMaxSpread = (pageCount: number): number => Math.max(0, Math.ceil(pageCount / 2) - 1);

const createDefaultPage = (pageNumber = 1): NotePage => ({
  id: createId(),
  title: pageNumber === 1 ? 'Study Note' : `Page ${pageNumber}`,
  content:
    pageNumber === 1
      ? [
          '# 学習ノート',
          '',
          'このアプリでは **重要語句** を隠して復習できます。',
          '',
          '次のような使い方がおすすめです。',
          '',
          '- 覚えたい語句を **太字** で記述',
          '- 見開きで読みながらクリックして想起',
          '- 表示回数で苦手箇所を把握'
        ].join('\n')
      : `# Page ${pageNumber}\n\nここにノートを書いてください。\n\n覚えたい箇所は **太字** にします。`
});

const createNotebook = (name: string): Notebook => {
  const firstPage = createDefaultPage(1);
  const now = new Date().toISOString();

  return {
    id: createId(),
    name,
    pages: [firstPage],
    createdAt: now,
    updatedAt: now,
    currentSpread: 0,
    selectedPageId: firstPage.id
  };
};

const splitMarkdownPages = (markdown: string): string[] => {
  const normalized = markdown.replace(/\r\n/g, '\n').trim();

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n(?:-{3,}|\*{3,}|_{3,})\s*\n/g)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
};

const createImportedPage = (content: string, index: number): NotePage => {
  const headingMatch = content.match(/^\s*#{1,6}\s+(.+)$/m);

  return {
    id: createId(),
    title: headingMatch?.[1]?.trim() || `Imported Page ${index + 1}`,
    content
  };
};

const sanitizeNotebook = (notebook: Notebook): Notebook => {
  const pages = notebook.pages.length > 0 ? notebook.pages : [createDefaultPage(1)];
  const maxSpread = getMaxSpread(pages.length);
  const selectedPageId = pages.some((page) => page.id === notebook.selectedPageId)
    ? notebook.selectedPageId
    : pages[0].id;

  return {
    ...notebook,
    pages,
    selectedPageId,
    currentSpread: Math.min(Math.max(notebook.currentSpread, 0), maxSpread)
  };
};

const defaultNotebooks = [createNotebook('My Notebook')];

const mapActiveNotebook = (
  notebooks: Notebook[],
  activeNotebookId: string | null,
  updater: (notebook: Notebook) => Notebook
): Notebook[] =>
  notebooks.map((notebook) => (notebook.id === activeNotebookId ? updater(notebook) : notebook));

export const useNoteStore = create<NoteState>()(
  persist(
    (set) => ({
      view: 'home',
      notebooks: defaultNotebooks,
      activeNotebookId: null,
      revealedMap: {},
      revealCountMap: {},
      createNotebook: (name) =>
        set((state) => {
          const trimmedName = name.trim();
          const notebookName = trimmedName || `Notebook ${state.notebooks.length + 1}`;
          const notebook = createNotebook(notebookName);

          return {
            notebooks: [notebook, ...state.notebooks],
            activeNotebookId: notebook.id,
            view: 'notebook'
          };
        }),
      renameNotebook: (id, name) =>
        set((state) => {
          const trimmedName = name.trim();

          if (!trimmedName) {
            return {};
          }

          return {
            notebooks: state.notebooks.map((notebook) =>
              notebook.id === id
                ? { ...notebook, name: trimmedName, updatedAt: new Date().toISOString() }
                : notebook
            )
          };
        }),
      deleteNotebook: (id) =>
        set((state) => {
          const notebooks = state.notebooks.filter((notebook) => notebook.id !== id);
          const deletingActive = state.activeNotebookId === id;

          return {
            notebooks: notebooks.length > 0 ? notebooks : [createNotebook('My Notebook')],
            activeNotebookId: deletingActive ? null : state.activeNotebookId,
            view: deletingActive ? 'home' : state.view
          };
        }),
      openNotebook: (id) =>
        set((state) => {
          if (!state.notebooks.some((notebook) => notebook.id === id)) {
            return {};
          }

          return {
            activeNotebookId: id,
            view: 'notebook'
          };
        }),
      goHome: () =>
        set(() => ({
          view: 'home',
          activeNotebookId: null
        })),
      addPage: () =>
        set((state) => {
          if (!state.activeNotebookId) {
            return {};
          }

          return {
            notebooks: mapActiveNotebook(state.notebooks, state.activeNotebookId, (notebook) => {
              const pageNumber = notebook.pages.length + 1;
              const newPage = createDefaultPage(pageNumber);
              const pages = [...notebook.pages, newPage];

              return {
                ...notebook,
                pages,
                selectedPageId: newPage.id,
                currentSpread: Math.floor((pages.length - 1) / 2),
                updatedAt: new Date().toISOString()
              };
            })
          };
        }),
      updatePage: (id, patch) =>
        set((state) => {
          if (!state.activeNotebookId) {
            return {};
          }

          return {
            notebooks: mapActiveNotebook(state.notebooks, state.activeNotebookId, (notebook) => ({
              ...notebook,
              pages: notebook.pages.map((page) => (page.id === id ? { ...page, ...patch } : page)),
              updatedAt: new Date().toISOString()
            }))
          };
        }),
      selectPage: (id) =>
        set((state) => {
          if (!state.activeNotebookId) {
            return {};
          }

          return {
            notebooks: mapActiveNotebook(state.notebooks, state.activeNotebookId, (notebook) => {
              const index = notebook.pages.findIndex((page) => page.id === id);

              if (index < 0) {
                return notebook;
              }

              return {
                ...notebook,
                selectedPageId: id,
                currentSpread: Math.floor(index / 2)
              };
            })
          };
        }),
      previousSpread: () =>
        set((state) => {
          if (!state.activeNotebookId) {
            return {};
          }

          return {
            notebooks: mapActiveNotebook(state.notebooks, state.activeNotebookId, (notebook) => ({
              ...notebook,
              currentSpread: Math.max(0, notebook.currentSpread - 1)
            }))
          };
        }),
      nextSpread: () =>
        set((state) => {
          if (!state.activeNotebookId) {
            return {};
          }

          return {
            notebooks: mapActiveNotebook(state.notebooks, state.activeNotebookId, (notebook) => ({
              ...notebook,
              currentSpread: Math.min(
                getMaxSpread(notebook.pages.length),
                notebook.currentSpread + 1
              )
            }))
          };
        }),
      importMarkdown: (markdown) =>
        set((state) => {
          if (!state.activeNotebookId) {
            return {};
          }

          const chunks = splitMarkdownPages(markdown);

          if (chunks.length === 0) {
            return {};
          }

          return {
            notebooks: mapActiveNotebook(state.notebooks, state.activeNotebookId, (notebook) => {
              const importedPages = chunks.map((chunk, index) => createImportedPage(chunk, index));
              const firstImportedIndex = notebook.pages.length;
              const pages = [...notebook.pages, ...importedPages];

              return {
                ...notebook,
                pages,
                selectedPageId: importedPages[0].id,
                currentSpread: Math.floor(firstImportedIndex / 2),
                updatedAt: new Date().toISOString()
              };
            })
          };
        }),
      toggleHidden: (hiddenId) =>
        set((state) => {
          const currentlyVisible = Boolean(state.revealedMap[hiddenId]);
          const nextVisible = !currentlyVisible;
          const currentCount = state.revealCountMap[hiddenId] ?? 0;

          return {
            revealedMap: {
              ...state.revealedMap,
              [hiddenId]: nextVisible
            },
            revealCountMap: {
              ...state.revealCountMap,
              [hiddenId]: nextVisible ? currentCount + 1 : currentCount
            }
          };
        })
    }),
    {
      name: 'study-note-app-state',
      version: 2,
      partialize: (state) => ({
        view: state.view,
        notebooks: state.notebooks,
        activeNotebookId: state.activeNotebookId,
        revealCountMap: state.revealCountMap
      }),
      migrate: (persistedState: unknown) => {
        const state = persistedState as Partial<NoteState> & {
          pages?: NotePage[];
          currentSpread?: number;
          selectedPageId?: string | null;
        };

        if (Array.isArray(state.notebooks)) {
          return {
            ...state,
            notebooks: state.notebooks.map(sanitizeNotebook),
            view: state.view === 'notebook' ? 'notebook' : 'home'
          };
        }

        if (Array.isArray(state.pages) && state.pages.length > 0) {
          const importedNotebook: Notebook = {
            id: createId(),
            name: 'Imported Notebook',
            pages: state.pages,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            currentSpread: Math.max(0, state.currentSpread ?? 0),
            selectedPageId: state.selectedPageId ?? state.pages[0]?.id ?? null
          };

          return {
            view: 'home' as AppView,
            notebooks: [sanitizeNotebook(importedNotebook)],
            activeNotebookId: null,
            revealCountMap: state.revealCountMap ?? {},
            revealedMap: {}
          };
        }

        return {
          view: 'home' as AppView,
          notebooks: defaultNotebooks,
          activeNotebookId: null,
          revealCountMap: {},
          revealedMap: {}
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        state.notebooks = (state.notebooks.length > 0 ? state.notebooks : defaultNotebooks).map(
          sanitizeNotebook
        );

        if (!state.activeNotebookId || !state.notebooks.some((nb) => nb.id === state.activeNotebookId)) {
          state.activeNotebookId = null;
          state.view = 'home';
        }
      }
    }
  )
);
