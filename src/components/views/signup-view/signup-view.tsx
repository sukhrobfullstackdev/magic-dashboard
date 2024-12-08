'use client';

import { HideRecaptchaBadge } from '@components/common/hide-recaptcha-badge';
import { useAnalytics } from '@components/hooks/use-analytics';
import { ANALYTICS_ACTION_NAMES } from '@constants/analytics-action-names';
import { GOOGLE_RECAPTCHA_KEY } from '@constants/grecaptcha';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCheckUserExistsMutation, useSignInMutation } from '@hooks/data/user';
import { compactObject } from '@libs/compact-object';
import { logger } from '@libs/datadog';
import { magicLegalLink } from '@libs/link-resolvers';
import { Button, Checkbox, IcoCheckmark, Text, TextInput, useToast } from '@magiclabs/ui-components';
import { sendGTMEvent } from '@next/third-parties/google';
import { css } from '@styled/css';
import { Box, Divider, Flex, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { setCookie } from 'nookies';
import { useCallback, useEffect, useState, type MouseEventHandler } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const featureText = [
  'Non-custodial key management',
  'Secure authentication',
  'API and embedded wallets',
  'Customizable and white-label UX',
  'Support for all major blockchains',
];

const schema = z.object({
  email: z.string().email().min(1),
  checked: z.boolean().refine((value) => value === true, { message: 'You must agree to the terms' }),
});

type FormData = z.infer<typeof schema>;

export const SignupView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { trackAction } = useAnalytics();

  const prefillEmail = searchParams?.get('email');
  const referralCode = searchParams?.get('referralCode');
  const { createToast } = useToast();

  const { mutateAsync: checkUserExists } = useCheckUserExistsMutation();

  const { mutateAsync: signUp } = useSignInMutation({
    onSuccess: (_, { email }) => {
      trackAction(ANALYTICS_ACTION_NAMES.SIGN_UP_COMPLETED, { email });

      createToast({
        message: 'Successfully signed up',
        variant: 'success',
      });
    },
    onError: (_, { email }) => {
      trackAction(ANALYTICS_ACTION_NAMES.SIGN_UP_FAILED, { email });
      sendGTMEvent({
        event: 'get_started_clicked',
        email,
      });

      createToast({
        message: 'Failed to sign up',
        variant: 'error',
      });
    },
  });

  const [isGoogleReCaptchaLoaded, setIsGoogleReCaptchaLoaded] = useState(false);

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

  const {
    register,
    handleSubmit,
    formState: { isValid, isSubmitting, errors },
    setError,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      email: prefillEmail || '',
      checked: false,
    },
  });
  const checked = watch('checked');

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      trackAction(ANALYTICS_ACTION_NAMES.CLICK_GET_STARTED, { email });

      const isUserExists = await checkUserExists({ email });
      if (isUserExists) {
        createToast({
          message: 'Account already exists. Please log in.',
          variant: 'error',
        });

        router.push(
          `/login?${new URLSearchParams(
            compactObject({
              ...Object.fromEntries(searchParams?.entries() ?? []),
              email,
            }),
          )}`,
        );
        return;
      }

      await signUp({ email });
    } catch (error) {
      if (error instanceof Error) {
        logger.warn('Failed to sign up', { error });
        return;
      }

      setError('email', {
        message: 'Something went wrong',
      });
    }
  });

  useEffect(() => {
    if (referralCode) {
      setCookie(null, 'magic_referral_code', referralCode as string, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        sameSite: 'Lax',
        domain: '.magic.link',
      });
    }
  }, [referralCode]);

  const handleStopPropagation: MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.stopPropagation();
  };

  const handleClick = useCallback(() => {
    setValue('checked', !checked, {
      shouldValidate: true,
    });
  }, [checked]);

  const handleLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  return (
    <>
      <Script src={`https://www.google.com/recaptcha/api.js?render=${GOOGLE_RECAPTCHA_KEY}`} onLoad={onRecaptchaLoad} />
      <HideRecaptchaBadge />
      <Box display="flex" height="100dvh" backgroundColor="surface.primary">
        {/* left side content */}
        <VStack alignItems="center" justifyContent="center" m={4} flex={1}>
          <VStack
            alignItems="center"
            justifyContent="center"
            px={4}
            py={0}
            m={4}
            flex={1}
            maxWidth="512px"
            width="full"
            gap={10}
          >
            <Image
              src="/images/mg_logos/banner.svg"
              alt="LOGO"
              width={110}
              height={40}
              style={{
                position: 'absolute',
                top: '40px',
                left: '40px',
              }}
            />

            <form
              onSubmit={onSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Text.H2 fontWeight="bold">Sign up for free</Text.H2>
              <Box mt={10} mb={6}>
                <TextInput
                  label="Work Email"
                  size="lg"
                  type="email"
                  placeholder="hiro@magic.link"
                  errorMessage={errors.email?.message}
                  disabled={isSubmitting}
                  {...register('email')}
                  onChange={(value) => register('email').onChange({ target: { name: 'email', value } })}
                />
              </Box>
              <HStack
                role="button"
                onClick={handleClick}
                gap={3}
                cursor="pointer"
                opacity={isSubmitting ? 0.7 : 1}
                pointerEvents={isSubmitting ? 'none' : 'auto'}
                mb={4}
              >
                <Checkbox name="termsAgreement" checked={checked} disabled={isSubmitting} />
                <Text size="xs" fontColor="text.tertiary">
                  I agree to the{' '}
                  <a
                    {...magicLegalLink('/terms-of-service')}
                    className={css({
                      color: 'brand.base',
                      fontWeight: 'semibold',
                    })}
                    role="link"
                    onClick={handleStopPropagation}
                    onKeyDown={(e) => e.stopPropagation()}
                    tabIndex={0}
                  >
                    Terms of Service
                  </a>
                  ,&nbsp;
                  <a
                    {...magicLegalLink('/privacy-policy')}
                    className={css({
                      color: 'brand.base',
                      fontWeight: 'semibold',
                    })}
                    role="link"
                    onClick={handleStopPropagation}
                    onKeyDown={(e) => e.stopPropagation()}
                    tabIndex={0}
                  >
                    Privacy Statement
                  </a>
                  , and&nbsp;
                  <a
                    {...magicLegalLink('/developer-license-agreement')}
                    className={css({
                      color: 'brand.base',
                      fontWeight: 'semibold',
                    })}
                    role="link"
                    onClick={handleStopPropagation}
                    onKeyDown={(e) => e.stopPropagation()}
                    tabIndex={0}
                  >
                    API & SDK License Agreement
                  </a>
                  .
                </Text>
              </HStack>
              <Button
                type="submit"
                label="Get started"
                size="lg"
                disabled={!isValid || isSubmitting || !isGoogleReCaptchaLoaded}
                validating={isSubmitting}
                expand
              />
            </form>

            <VStack w="full" gap={4}>
              <Divider color="neutral.tertiary" />

              <HStack alignItems="center" justifyContent="space-between" width="full">
                <Text fontColor="text.tertiary">Have an account?</Text>
                <Button label="Log in" variant="text" onPress={handleLogin} />
              </HStack>
            </VStack>
            <Text size="xs" fontColor="text.tertiary">
              This site is protected by reCAPTCHA and the Google{' '}
              <a
                href="https://policies.google.com/privacy"
                className={css({ color: 'brand.base', fontWeight: 'semibold' })}
              >
                Privacy Policy
              </a>{' '}
              and{' '}
              <a
                href="https://policies.google.com/terms"
                className={css({ color: 'brand.base', fontWeight: 'semibold' })}
              >
                Terms of Service
              </a>{' '}
              apply.
            </Text>
          </VStack>
        </VStack>

        {/* right side content */}
        <VStack
          className={css({
            '@media screen and (max-width: 1024px)': {
              display: 'none',
            },
          })}
          alignContent="center"
          justifyContent="center"
          flex={1}
          m={4}
          boxSizing="border-box"
          overflow="hidden"
          position="relative"
        >
          <Image
            src="/images/onboarding_img/signup_card.png"
            fill
            priority
            alt="Sign Up"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              objectFit: 'fill',
              width: '100%',
              height: '100%',
              zIndex: 3,
              padding: '16px',
              boxSizing: 'border-box',
            }}
          />
          <VStack alignItems="start" justifyContent="center" gap={8} width="full" maxW="448px" zIndex={7}>
            <Text.H5 fontWeight="semibold" styles={{ color: token('colors.chalk') }}>
              The best way to build onchain
            </Text.H5>
            <VStack alignItems="start" gap={4}>
              {featureText.map((txt) => (
                <Flex key={txt} alignItems="center" gap={4}>
                  <IcoCheckmark height={20} width={20} color={token('colors.brand.lighter')} />
                  <Text size="lg" styles={{ color: token('colors.chalk') }}>
                    {txt}
                  </Text>
                </Flex>
              ))}
            </VStack>
          </VStack>
        </VStack>
      </Box>
    </>
  );
};
