import { PlayerView } from '@renderer/features/player';
import { useLocation, useParams } from '@renderer/router';

export default function PlayPage() {
  const { songId } = useParams<{ songId: string }>();
  const at = Number(useLocation().query.get('at'));
  const startAt = Number.isFinite(at) && at > 0 ? at : undefined;
  return <PlayerView key={`${songId}:${startAt}`} songId={songId} startAt={startAt} />;
}
