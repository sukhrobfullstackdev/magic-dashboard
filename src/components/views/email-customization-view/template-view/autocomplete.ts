import { autocompletion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete';

export type NestedObject = {
  [key: string]: NestedObject | string | number | boolean;
};

function getFormattedDate() {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const date = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  const timezone = 'PDT';

  return `${hours}:${minutes}:${seconds} ${timezone} on ${monthName} ${day}, ${year}`;
}

export const autocompleteData: NestedObject = {
  app: {
    name: 'My App',
  },
  theme: {
    style: 'light',
    primary_color: '#eee4444',
    logo_uri: 'https://example.org/avatar.png',
    is_whitelabel: true,
  },
  login: {
    device: {
      browser: 'Chrome',
      os: 'MacOS',
    },
    timestamp: getFormattedDate(),
  },
  user: {
    email: 'joe@example.com',
    phone_number: '+19428675309',
  },
  template: {
    use_case: 'login_email_otp',
    variation: 'default',
    content_type: 'text/html',
    locale: 'en_US',
  },
  otp: 123456,
  magic_link: 'https://auth.magic.link/confirm?tlt=eyJ0eXAiOiJKV1QiLCJhbGciOaczX8i=',
};

const flattenAutocompleteData = (node: NestedObject, path = ''): Record<string, string> => {
  return Object.keys(node).reduce((acc: Record<string, string>, key) => {
    const newPath = path ? `${path}.${key}` : key;
    return {
      ...acc,
      ...(typeof node[key] === 'object' && node[key] !== null
        ? flattenAutocompleteData(node[key] as NestedObject, newPath)
        : { [newPath]: node[key] as string }),
    };
  }, {});
};

export const flatAutocompleteData = flattenAutocompleteData(autocompleteData);

function isLeaf(data: NestedObject, path: string): boolean {
  const segments = path.split('.');
  let current: NestedObject | string | number | boolean = data;

  for (const segment of segments) {
    if (typeof current !== 'object' || !current[segment]) {
      return false;
    }
    current = current[segment];
  }

  return typeof current !== 'object';
}

function shouldTriggerAutocomplete(state: CompletionContext['state']) {
  const cursor = state.selection.main.from;
  const charsAfterCursor = state.sliceDoc(cursor, cursor + 2); // Get the two characters after the cursor

  return charsAfterCursor === '}}';
}

function completionProvider(context: CompletionContext): CompletionResult | null {
  if (!shouldTriggerAutocomplete(context.state)) return null; // Do not offer completions if the trigger isn't matched

  // Get the text to the left of the cursor up to a certain distance or a line start.
  const line = context.state.doc.lineAt(context.pos);
  const lineTextToCursor = line.text.slice(0, context.pos - line.from);

  // Split the text by non-word characters to get segments of the path
  const path = lineTextToCursor.split(/\W+/).filter(Boolean);

  // Determine the current input to filter the completion data
  const currentInput = path.length ? path[path.length - 1] : '';

  // Generate a filtered list of potential completion matches from `flatAutocompleteData`
  const potentialMatches = Object.keys(flatAutocompleteData)
    .filter((key) => key.startsWith(currentInput))
    .map((key) => {
      // If the match isn't a leaf, append a `.`
      return isLeaf(autocompleteData, key) ? key : `${key}.`;
    });

  if (!potentialMatches.length) return null;

  return {
    from: context.pos - currentInput.length,
    to: context.pos,
    options: potentialMatches.map((label) => ({ label })),
  };
}

export const autocompleteExtensions = [autocompletion({ override: [completionProvider] })];
