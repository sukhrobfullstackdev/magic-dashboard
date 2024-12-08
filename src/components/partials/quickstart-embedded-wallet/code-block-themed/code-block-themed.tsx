import { CircleCopyIcon } from '@components/partials/copy-icon/copy-icon';
import { Box } from '@styled/jsx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus as dark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type Props = {
  codeString: string;
  language: string;
  showLineNumbers?: boolean;
  oneLine?: boolean;
};

export const CodeBlockThemed = ({ codeString, language, showLineNumbers = true, oneLine = false }: Props) => {
  return (
    <Box position="relative">
      <Box
        position="absolute"
        top={oneLine ? '50%' : '20px'}
        right={oneLine ? '-8px' : '16px'}
        transform={oneLine ? 'translate(-50%, -50%)' : 'none'}
      >
        <CircleCopyIcon value={codeString} />
      </Box>
      <SyntaxHighlighter
        style={dark}
        language={language}
        showLineNumbers={showLineNumbers}
        showInlineLineNumbers={false}
        lineNumberStyle={{ color: 'rgba(255, 255, 255, 0.35)' }}
        customStyle={{ userSelect: 'text', borderRadius: '0.75rem', overflow: 'auto' }}
      >
        {codeString}
      </SyntaxHighlighter>
    </Box>
  );
};
