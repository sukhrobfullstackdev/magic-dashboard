export const DEFAULT_RQ_CONFIG = {
  queries: {
    suspense: false,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    gcTime: 1000 * 60 * 60 * 24 * 7, //
  },
};

export const DEFAULT_RQ_CUSTOM_CONFIG = {
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
};

export const DEFAULT_RQ_SUSPENSE_CONFIG = {
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  gcTime: 1000 * 60 * 60 * 24 * 7, //1 week
};
