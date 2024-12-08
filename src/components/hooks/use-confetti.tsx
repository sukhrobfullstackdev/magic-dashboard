import { useSharedState } from '@components/hooks/use-shared-state';
import { useTimeout } from '@components/hooks/use-timeout';
import ReactCanvasConfetti from 'react-canvas-confetti';
import { createPortal } from 'react-dom';

type Confetti = {
  options?: confetti.Options;
  timeout?: number;
};

const defaultOptions: confetti.Options = {
  angle: 90,
  particleCount: 300,
  scalar: 1.3,
  spread: 200,
  startVelocity: 50,
  decay: 0.9,
  shapes: ['circle', 'square'],
  origin: {
    x: 0.5,
    y: 0.3,
  },
};

export const useConfetti = () => {
  const [, setConfetti] = useSharedState<Confetti | null>(['confetti'], null);

  const showConfetti = (confettiOptions?: Confetti) => {
    setConfetti({
      options: {
        ...defaultOptions,
        ...confettiOptions?.options,
      },
      timeout: confettiOptions?.timeout ?? 5000,
    });
  };

  return showConfetti;
};

export const Confetti = () => {
  const [confetti, setConfetti] = useSharedState<Confetti | null>(['confetti'], null);

  useTimeout(() => {
    setConfetti(null);
  }, confetti?.timeout || 0);

  return confetti ? (
    <>
      {createPortal(
        <div
          style={{
            position: 'absolute',
            zIndex: 9999,
            width: '100vw',
            height: '100vh',
            left: 0,
            top: 0,
            pointerEvents: 'none',
          }}
        >
          <ReactCanvasConfetti
            refConfetti={(instance) => {
              if (instance) {
                instance(confetti.options);
              }
            }}
            style={{
              position: 'absolute',
              zIndex: 9999,
              width: '100vw',
              height: '100vh',
              left: 0,
              top: 0,
              pointerEvents: 'none',
            }}
          />
        </div>,
        document.getElementById('portal')!,
      )}
    </>
  ) : (
    <></>
  );
};
