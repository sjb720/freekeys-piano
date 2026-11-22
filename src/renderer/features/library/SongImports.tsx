import { FilePlus } from 'lucide-react';
import { DropOverlay } from '@renderer/ui';
import { ImportResultSheet } from './ImportResultSheet';
import { useSongDrop } from './useSongDrop';

export function SongImports() {
  const dragging = useSongDrop();
  return (
    <>
      <DropOverlay visible={dragging} icon={FilePlus} label="Drop to add songs" />
      <ImportResultSheet />
    </>
  );
}
