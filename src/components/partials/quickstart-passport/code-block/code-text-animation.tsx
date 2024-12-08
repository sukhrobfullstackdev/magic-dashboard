import { Text } from '@magiclabs/ui-components';
import { Box, HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useEffect, useState } from 'react';

interface CodeTextAnimationProps {
  text: string;
  speed?: number;
  randomCharSpeed?: number;
  cycles?: number;
}

export const CodeTextAnimation = ({ text, speed = 15, randomCharSpeed = 25, cycles = 5 }: CodeTextAnimationProps) => {
  const [displayedText, setDisplayedText] = useState(Array(text.length).fill(''));
  const [cursorVisible, setCursorVisible] = useState(true);
  const randomChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

  useEffect(() => {
    setCursorVisible(true);
    const intervalIds: NodeJS.Timeout[] = [];
    const cycleCharacter = (index: number) => {
      let cycleCount = 0;

      const intervalId = setInterval(() => {
        if (cycleCount < cycles) {
          setDisplayedText((prev: string[]) => {
            const newText = [...prev];
            newText[index] = randomChars[Math.floor(Math.random() * randomChars.length)];
            return newText;
          });
          cycleCount++;
        } else {
          clearInterval(intervalId);
          setDisplayedText((prev: string[]) => {
            const newText = [...prev];
            newText[index] = text[index];
            return newText;
          });
        }
      }, randomCharSpeed);

      intervalIds.push(intervalId);
    };

    const startTypingEffect = () => {
      text.split('').forEach((_, index) => {
        setTimeout(() => {
          cycleCharacter(index);
        }, index * speed);
      });
    };

    startTypingEffect();

    return () => intervalIds.forEach(clearInterval);
  }, [text, speed, randomCharSpeed, cycles, randomChars]);

  useEffect(() => {
    if (displayedText.filter(Boolean).length === text.length) {
      setCursorVisible(false);
    }
  }, [displayedText, text.length]);

  return (
    <HStack gap={0} w="full" h={6}>
      <Text.Mono styles={{ color: token('colors.text.quaternary') }}>{displayedText.join('')}</Text.Mono>
      {cursorVisible && <Box w={3} h={5} bg="text.quaternary" />}
    </HStack>
  );
};
