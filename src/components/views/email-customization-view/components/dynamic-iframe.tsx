import { css } from '@styled/css';
import { useEffect, useRef } from 'react';

const IframeContainer = ({ channelName }: { channelName: string }) => {
  const iframeContent = `
    <html>
      <head>
      <script type="module">
        const channel = new BroadcastChannel('${channelName}');
        const handleMessage = (event) => {
            if (typeof event.data.html === 'string') {
              document.body.innerHTML = event.data.html;
            }
        };
        channel.onmessage = handleMessage;
        channel.postMessage({
            isReady: true,
        });
      </script>
      </head>
      <body style="margin: 0">
      </body>
    </html>
    `;
  return (
    // Without both of these sandbox attributes, the email template preview will not render
    // skipcq: JS-D010
    <iframe
      title="template-view"
      sandbox="allow-scripts allow-same-origin"
      className={css({ h: 'full', w: 'full' })}
      srcDoc={iframeContent}
    ></iframe>
  );
};

/**
 ** DynamicIframe can take either html or a customChannelName. If given html, it
 ** will update the content of the iframe without requiring the iframe to reload.
 ** Given a customChannelName, it will subscribe to broadast channels of that
 ** name and any 'html' event data broadcasted will be updated inside the iframe.
 **
 ** Note: iframe is running in sandbox mode with "allow-scripts" and "allow-same-origin".
 ** This is generally considered insecure for many use cases, so extra precautions should
 ** be taken when using this with user-input html (e.g. sanitizing input with DOMPurify)
 **/
export const DynamicIframe = ({ html, customChannelName }: { html?: string; customChannelName?: string }) => {
  const channelName = useRef(customChannelName || crypto.randomUUID());
  const channel = useRef(new BroadcastChannel(channelName.current));

  useEffect(() => {
    const currentChannel = channel.current;
    const handleMessage = (event?: MessageEvent) => {
      if (event?.data.isReady) {
        currentChannel.postMessage({
          html,
        });
      }
    };

    currentChannel.addEventListener('message', handleMessage);

    return () => {
      currentChannel.removeEventListener('message', handleMessage);
    };
  }, [html]);

  useEffect(() => {
    const currentChannel = channel.current;
    currentChannel.postMessage({
      html,
    });
  }, [html]);

  return <IframeContainer channelName={channelName.current} />;
};
