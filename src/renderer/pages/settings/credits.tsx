import { Credits } from '@renderer/features/credits';
import { Page } from '@renderer/features/shell';

export default function CreditsPage() {
  return (
    <Page title="Credits & licenses" narrow>
      <Credits />
    </Page>
  );
}
