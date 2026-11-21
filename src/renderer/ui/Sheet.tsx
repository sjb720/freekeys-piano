import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './IconButton';
import styles from './Sheet.module.css';
import { Stack } from './Stack';
import { Text } from './Text';

export type SheetProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Sheet({ title, open, onClose, children }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal
        aria-label={title}
        tabIndex={-1}
        className={styles.panel}
      >
        <Stack direction="row" align="center" justify="between">
          <Text variant="heading">{title}</Text>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </Stack>
        {children}
      </div>
    </div>,
    document.body,
  );
}
