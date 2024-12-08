'use client';

import { LocalStoragePnPKeys } from '@components/views/login-view/local-storage-pnp-keys';
import { GOOGLE_RECAPTCHA_KEY } from '@constants/grecaptcha';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCheckUserExistsMutation, useSignInMutation } from '@hooks/data/user';
import { compactObject } from '@libs/compact-object';
import { logger } from '@libs/datadog';
import { Button, IcoArrowRight, Text, TextInput, useToast } from '@magiclabs/ui-components';
import { Box, HStack, VStack } from '@styled/jsx';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email().min(1),
});

type FormData = z.infer<typeof schema>;

export const LoginView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isGoogleReCaptchaLoaded, setIsGoogleReCaptchaLoaded] = useState(false);

  /**
   * Listen for the Google ReCaptcha script to load
   * Show the overlay if session hydration fails
   */
  /**
   * Listen for the Google ReCaptcha script to load
   * Show the overlay if session hydration fails
   */
  useEffect(() => {
    window?.grecaptcha?.ready(() => {
      setIsGoogleReCaptchaLoaded(true);
    });
  }, []);

  const onRecaptchaLoad = useCallback(() => {
    setIsGoogleReCaptchaLoaded(true);
  }, []);

  const prefillEmail = searchParams?.get('email');
  const { createToast } = useToast();

  const { mutateAsync: checkUserExists } = useCheckUserExistsMutation();

  const { mutateAsync: signIn } = useSignInMutation({
    onSuccess: () => {
      createToast({
        message: 'Successfully logged in',
        variant: 'success',
      });
    },
    onError: () => {
      createToast({
        message: 'Failed to login',
        variant: 'error',
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { isValid, isSubmitting, errors },
    setError,
  } = useForm<FormData>({
    mode: 'onBlur',
    resolver: zodResolver(schema),
    defaultValues: {
      email: prefillEmail || '',
    },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      const isUserExists = await checkUserExists({ email });

      if (!isUserExists) {
        createToast({
          message: 'Account not found. Sign up instead?',
          variant: 'error',
        });

        router.push(
          `/signup?${new URLSearchParams(
            compactObject({
              ...Object.fromEntries(searchParams?.entries() ?? []),
              email,
            }),
          )}`,
        );
        return;
      }

      await signIn({ email });
    } catch (error) {
      if (error instanceof Error) {
        logger.warn('Failed to sign in', { error });
        return;
      }

      setError('email', {
        message: 'Something went wrong',
      });
    }
  });

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <>
      <Head>
        <meta name="description" content="Welcome back. Let's make some magic happen." />
      </Head>
      <Script src={`https://www.google.com/recaptcha/api.js?render=${GOOGLE_RECAPTCHA_KEY}`} onLoad={onRecaptchaLoad} />
      <LocalStoragePnPKeys>
        <VStack alignItems="center" justifyContent="center" height="100dvh" backgroundColor="surface.primary">
          <VStack alignItems="center" gap={0} width="full" maxW="370px">
            <Image src="/images/magic_logo_no_looping.gif" alt="Magic" width={56} height={56} unoptimized />
            <Box mt="30px" mb="44px" width="full">
              <form onSubmit={onSubmit}>
                <VStack alignItems="center" width="full" gap={0}>
                  <Text.H1>Welcome back</Text.H1>
                  <Box mt="12px" mb="40px">
                    <Text fontColor="text.tertiary">Let’s make some magic happen</Text>
                  </Box>
                  <Box mb="24px" width="full">
                    <TextInput
                      aria-label="Email address"
                      type="email"
                      placeholder="hiro@magic.link"
                      errorMessage={errors.email?.message}
                      disabled={isSubmitting}
                      {...register('email')}
                      onChange={(value) => register('email').onChange({ target: { name: 'email', value } })}
                    />
                  </Box>
                  <Button
                    type="submit"
                    label="Log in"
                    size="lg"
                    disabled={!isValid || isSubmitting || !isGoogleReCaptchaLoaded}
                    validating={isSubmitting}
                    expand
                  />
                </VStack>
              </form>
            </Box>
            <HStack alignItems="center" justifyContent="space-between" width="full">
              <Text>No account?</Text>
              <Button label="Sign up" variant="text" onPress={handleSignUp}>
                <Button.TrailingIcon>
                  <IcoArrowRight />
                </Button.TrailingIcon>
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </LocalStoragePnPKeys>
    </>
  );
};
