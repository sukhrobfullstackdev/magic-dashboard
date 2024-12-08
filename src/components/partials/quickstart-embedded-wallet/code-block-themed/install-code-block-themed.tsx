import { CircleCopyIcon } from '@components/partials/copy-icon/copy-icon';
import { Content, List, Root, Trigger } from '@radix-ui/react-tabs';
import { css } from '@styled/css';
import { HStack } from '@styled/jsx';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const COMMANDS = {
  NPM: {
    code: 'npm install --save magic-sdk',
    language: 'shell',
  },
  PNPM: {
    code: 'pnpm add magic-sdk',
    language: 'shell',
  },
  CDN: {
    code: '<script src="https://auth.magic.link/sdk"></script>',
    language: 'html',
  },
} as const;

export const InstallCodeBlockThemed = () => {
  const DEFAULT_TAB = Object.keys(COMMANDS)[0] as keyof typeof COMMANDS;
  const [selectedTab, setSelectedTab] = useState(DEFAULT_TAB);

  return (
    <Root
      className={css({ bg: '#1e1e1e;', px: 4, py: 3, position: 'relative', rounded: 'xl' })}
      defaultValue={DEFAULT_TAB}
      onValueChange={(value) => setSelectedTab(value as keyof typeof COMMANDS)}
    >
      <List
        className={css({ pb: 1.5, borderBottomWidth: 'thin', borderBottomColor: 'text.tertiary' })}
        aria-controls="tabs"
      >
        <HStack justifyContent="space-between">
          <HStack gap={4}>
            {Object.keys(COMMANDS).map((key) => {
              const isSelected = selectedTab === key;
              return (
                <Trigger
                  key={key}
                  value={key}
                  className={css({
                    color: isSelected ? 'surface.primary' : 'neutral.primary',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    position: 'relative',
                    _before: {
                      content: isSelected ? '""' : 'none',
                      position: 'absolute',
                      bottom: '-0.75rem',
                      left: 0,
                      w: 'full',
                      h: 1,
                      bg: 'surface.primary',
                      transition: 'all 0.3s ease-in-out',
                      roundedTop: '6.25rem',
                    },
                  })}
                >
                  {key}
                </Trigger>
              );
            })}
          </HStack>
          <CircleCopyIcon value={COMMANDS[selectedTab].code} />
        </HStack>
      </List>
      <Content value={'NPM'}>
        <SyntaxHighlighter language={COMMANDS.NPM.language} style={vscDarkPlus} customStyle={{ paddingLeft: 0 }}>
          {COMMANDS.NPM.code}
        </SyntaxHighlighter>
      </Content>
      <Content value={'PNPM'}>
        <SyntaxHighlighter language={COMMANDS.PNPM.language} style={vscDarkPlus} customStyle={{ paddingLeft: 0 }}>
          {COMMANDS.PNPM.code}
        </SyntaxHighlighter>
      </Content>
      <Content value={'CDN'}>
        <SyntaxHighlighter language={COMMANDS.CDN.language} style={vscDarkPlus} customStyle={{ paddingLeft: 0 }}>
          {COMMANDS.CDN.code}
        </SyntaxHighlighter>
      </Content>
    </Root>
  );
};
