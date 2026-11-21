import { PlayerView } from '@renderer/features/player';
import { useParams } from '@renderer/router';

export default function PlayPage() {
  const { songId } = useParams<{ songId: string }>();
  return <PlayerView key={songId} songId={songId} />;
}
