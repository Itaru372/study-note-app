export interface NotePage {
  id: string;
  title: string;
  content: string;
}

export interface Notebook {
  id: string;
  name: string;
  pages: NotePage[];
  createdAt: string;
  updatedAt: string;
  currentSpread: number;
  selectedPageId: string | null;
}

export type AppView = 'home' | 'notebook';
