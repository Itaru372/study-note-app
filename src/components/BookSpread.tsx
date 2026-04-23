import type { NotePage } from '../types';
import { MarkdownPage } from './MarkdownPage';

interface BookSpreadProps {
  pages: NotePage[];
  currentSpread: number;
  selectedPageId: string | null;
  onSelectPage: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

const getMaxSpread = (pageCount: number): number => Math.max(0, Math.ceil(pageCount / 2) - 1);

export function BookSpread({
  pages,
  currentSpread,
  selectedPageId,
  onSelectPage,
  onPrev,
  onNext
}: BookSpreadProps): JSX.Element {
  const leftIndex = currentSpread * 2;
  const rightIndex = leftIndex + 1;
  const leftPage = pages[leftIndex];
  const rightPage = pages[rightIndex];
  const maxSpread = getMaxSpread(pages.length);

  return (
    <section className="book-shell">
      <button
        type="button"
        className="nav-arrow nav-arrow--left"
        onClick={onPrev}
        disabled={currentSpread <= 0}
        aria-label="前の見開きへ"
      >
        ‹
      </button>

      <div className="book-spread" role="group" aria-label="見開き表示">
        <MarkdownPage
          page={leftPage}
          side="left"
          pageNumber={leftIndex + 1}
          isSelected={leftPage?.id === selectedPageId}
          onSelectPage={onSelectPage}
        />
        <MarkdownPage
          page={rightPage}
          side="right"
          pageNumber={rightIndex + 1}
          isSelected={rightPage?.id === selectedPageId}
          onSelectPage={onSelectPage}
        />
      </div>

      <button
        type="button"
        className="nav-arrow nav-arrow--right"
        onClick={onNext}
        disabled={currentSpread >= maxSpread}
        aria-label="次の見開きへ"
      >
        ›
      </button>
    </section>
  );
}
