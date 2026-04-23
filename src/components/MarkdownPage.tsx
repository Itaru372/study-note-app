import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { NotePage } from '../types';
import { HiddenText } from './HiddenText';
import type { MouseEvent } from 'react';

interface MarkdownPageProps {
  page: NotePage | undefined;
  side: 'left' | 'right';
  pageNumber: number;
  isSelected: boolean;
  onSelectPage: (id: string) => void;
}

export function MarkdownPage({
  page,
  side,
  pageNumber,
  isSelected,
  onSelectPage
}: MarkdownPageProps): JSX.Element {
  if (!page) {
    return (
      <article className={`book-page ${side} is-empty`} aria-label={`${pageNumber}ページ`}>
        <div className="book-page__empty">No content</div>
        <footer className="book-page__footer">{pageNumber}</footer>
      </article>
    );
  }

  let strongIndex = 0;
  const markdownComponents: Components = {
    strong: ({ children }) => {
      strongIndex += 1;
      return <HiddenText hiddenId={`${page.id}:strong:${strongIndex}`}>{children}</HiddenText>;
    }
  };

  const handleSelect = (): void => {
    onSelectPage(page.id);
  };

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    const target = event.target as HTMLElement;

    if (target.closest('button, input, textarea, a')) {
      return;
    }

    handleSelect();
  };

  return (
    <article
      className={`book-page ${side} ${isSelected ? 'is-selected' : ''}`}
      aria-label={`${pageNumber}ページ ${page.title}`}
      onClick={handleClick}
    >
      <header className="book-page__header">
        <button
          type="button"
          className={`book-page__select ${isSelected ? 'is-selected' : ''}`}
          onClick={handleSelect}
        >
          {page.title}
        </button>
      </header>
      <div className="book-page__content">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {page.content}
        </ReactMarkdown>
      </div>
      <footer className="book-page__footer">{pageNumber}</footer>
    </article>
  );
}
