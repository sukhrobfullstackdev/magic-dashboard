import { Box, Circle, Flex, HStack, Stack } from '@styled/jsx';
import { Children, useEffect, useState, type PropsWithChildren } from 'react';
import { useSwipeable } from 'react-swipeable';

type Props = PropsWithChildren;

export const ImageCarousel = ({ children }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [children]);

  const updateIndex = (newIndex: number) => {
    let index = newIndex;
    if (newIndex < 0) {
      index = Children.count(children) - 1;
    } else if (newIndex >= Children.count(children)) {
      index = 0;
    }
    setActiveIndex(index);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => updateIndex(activeIndex + 1),
    onSwipedRight: () => updateIndex(activeIndex - 1),
  });

  return (
    <Stack
      mx="auto"
      gap={0}
      justifyContent="end"
      overflow="hidden"
      maxW="322px"
      minH="480px"
      xlDown={{ maxW: '260px', minH: '400px' }}
      lgDown={{ maxW: '322px', minH: 'fit-content' }}
      {...handlers}
    >
      <Flex transition="transform 0.3s" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {Children.map(children, (child) => (
          <Box w="full" flexShrink={0}>
            {child}
          </Box>
        ))}
      </Flex>
      <HStack gap={3} mt={4} mb={6} justifyContent="center">
        {Children.map(children, (_, index) => (
          <Circle
            h={2}
            w={2}
            bg={index === activeIndex ? 'text.primary' : 'neutral.secondary'}
            cursor="pointer"
            role="button"
            tabIndex={0}
            onClick={() => updateIndex(index)}
            onKeyPress={() => updateIndex(index)}
          />
        ))}
      </HStack>
    </Stack>
  );
};
