import type { ReactNode } from 'react';
import { useNoteStore } from '../store/useNoteStore';

interface HiddenTextProps {
  hiddenId: string;
  children: ReactNode;
}

export function HiddenText({ hiddenId, children }: HiddenTextProps): JSX.Element {
  const isVisible = useNoteStore((state) => Boolean(state.revealedMap[hiddenId]));
  const count = useNoteStore((state) => state.revealCountMap[hiddenId] ?? 0);
  const toggleHidden = useNoteStore((state) => state.toggleHidden);

  return (
    <button
      type="button"
      className={`hidden-token ${isVisible ? 'is-visible' : 'is-hidden'}`}
      onClick={(event) => {
        event.stopPropagation();
        toggleHidden(hiddenId);
      }}
      aria-label={isVisible ? '隠しテキストを再び隠す' : '隠しテキストを表示する'}
      title={isVisible ? 'クリックで再度隠す' : 'クリックで表示'}
    >
      <span className="hidden-token__value">
        {isVisible ? children : <span className="hidden-token__placeholder">••••</span>}
      </span>
      <span className="hidden-token__count">表示 {count}</span>
    </button>
  );
}
