import { type AnimationProps, type MotionAdvancedProps, type TargetAndTransition, type Variants } from 'framer-motion';
import { useMemo } from 'react';

export class MotionVariantsHook<TCustom = void, TVariants extends string | void = void> {
  private variants: Variants = {};

  public add<TName extends string>(
    name: TName,
    variant: TargetAndTransition | ((custom: TCustom) => TargetAndTransition),
  ): MotionVariantsHook<TCustom, Exclude<TVariants, void> | TName> {
    this.variants[name] = variant;
    return this as MotionVariantsHook<TCustom, Exclude<TVariants, void> | TName>;
  }

  public use(targets: {
    initial?: TVariants;
    animate?: TVariants;
    exit?: TVariants;
  }): (custom?: TCustom) => AnimationProps & MotionAdvancedProps {
    const { initial, animate, exit } = targets;
    return (custom = {} as TCustom) => ({
      custom,
      initial: initial as string,
      animate: animate as string,
      exit: exit as string,
      variants: this.variants,
    });
  }
}

export const useFade = () => {
  const hook = useMemo(
    () => new MotionVariantsHook<void>().add('visible', { opacity: 1 }).add('hidden', { opacity: 0 }),
    [],
  );

  return hook.use({
    initial: 'hidden',
    animate: 'visible',
    exit: 'hidden',
  });
};

export const useExpand = () => {
  const hook = useMemo(
    () =>
      new MotionVariantsHook()
        .add('hidden', {
          opacity: 0,
          scale: 0.7,
        })
        .add('visible', {
          opacity: 1,
          scale: 1,
          transition: { type: 'spring', velocity: 3, stiffness: 500, damping: 30 },
        }),
    [],
  );

  return hook.use({
    initial: 'hidden',
    animate: 'visible',
    exit: 'hidden',
  });
};

export const useSlide = () => {
  const hook = useMemo(() => {
    const transition = { ease: 'easeInOut', duration: 0.15 };
    return new MotionVariantsHook<{ x: number; y: number }>()
      .add('hidden', ({ x, y }) => ({ x, y, transition }))
      .add('visible', { x: 0, y: 0, transition });
  }, []);

  return hook.use({
    initial: 'hidden',
    animate: 'visible',
    exit: 'hidden',
  });
};
