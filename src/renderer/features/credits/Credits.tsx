import { ExternalLink, Music, Piano } from 'lucide-react';
import { SAMPLE_CREDIT } from '@shared/credits';
import { Card, Icon, ListItem, Stack, Text } from '@renderer/ui';
import { useCredits } from './useCredits';

const open = (url: string) => void window.api.app.openCreditLink(url);

export function Credits() {
  const credits = useCredits();
  const sources = [...new Set(credits?.map((c) => c.source))];

  return (
    <>
      <Card gap="sm">
        <Text variant="heading">FreeKeys</Text>
        <Text tone="muted">
          The app’s code is open source under the MIT license. That license covers the code only:
          the songs and piano sound included with the app keep their own licenses, listed below.
        </Text>
      </Card>
      <Stack gap="sm">
        <Text variant="heading">Piano sound</Text>
        <ListItem
          icon={Piano}
          title={SAMPLE_CREDIT.title}
          subtitle={`By ${SAMPLE_CREDIT.credit} · ${SAMPLE_CREDIT.license}`}
          trailing={<Icon icon={ExternalLink} />}
          onPress={() => open(SAMPLE_CREDIT.licenseUrl)}
        />
      </Stack>
      {credits && credits.length > 0 && (
        <Stack gap="sm">
          <Stack gap="none">
            <Text variant="heading">Included songs ({credits.length})</Text>
            <Text variant="caption" tone="muted">
              From {sources.join(', ')}. Each file’s embedded title was changed to “Composer:
              Title”. Files under Creative Commons keep that license, with this attribution. Tap a
              song for its source page.
            </Text>
          </Stack>
          {credits.map((credit) => (
            <ListItem
              key={credit.file}
              icon={Music}
              title={credit.title}
              subtitle={`Typeset by ${credit.credit} · ${credit.license}`}
              trailing={<Icon icon={ExternalLink} />}
              onPress={() => open(credit.page)}
            />
          ))}
        </Stack>
      )}
    </>
  );
}
