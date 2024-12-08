import { usePathname } from 'next/navigation';

function useRouteMatch(path: string): boolean {
  const pathname = usePathname();
  return pathname === path;
}

/**
 * Get React Router matches for `/app/*` routes.
 */
export function useAppRouteMatches() {
  return {
    // Match booleans
    isHomeRoute: useRouteMatch('/app'),
    isUsersRoute: useRouteMatch('/app/users'),
    isEventLogsRoute: useRouteMatch('/app/event_logs'),
    isApiKeyRoute: useRouteMatch('/app/apikey'),
    isLoginFormRoute: useRouteMatch('/app/login_form'),
    isWidgetUIRoute: useRouteMatch('/app/widget_ui'),
    isEmailCustomizationRoute: useRouteMatch('/app/email_customization'),
    isBrandingRoute: useRouteMatch('/app/branding'),
    isCustomizationRoute: useRouteMatch('/app/customization'),
    isWalletProvidersRoute: useRouteMatch('/app/wallet_providers'),
    isSocialLoginSettings: useRouteMatch('/app/social_login/[provider]'),
    isAuthLoginSettings: useRouteMatch('/app/magic_login'),
    isMfaSettings: useRouteMatch('/app/mfa'),
    isGasSubsidyRoute: useRouteMatch('/app/gasless'),
    isNftCheckoutRoute: useRouteMatch('/app/nft_checkout'),
    isSocialLoginTestConnectionCallback: useRouteMatch('/app/social_login/test_connection_callback'),
    isSettingsRoute: useRouteMatch('/app/settings'),
    isPlanAndBillingRoute: useRouteMatch('/account/billing'),
    isAccountTeamRoute: useRouteMatch('/account/team'),
    isCheckoutUpgradeRoute: useRouteMatch('/checkout/upgrade'),
  };
}
