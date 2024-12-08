import { CustomError } from '@libs/error';
import { type FortmaticAPIResponse } from '@services/http/magic-rest';

export async function emitRequest<T extends FortmaticAPIResponse>(options: {
  url: string;
  init?: RequestInit;
}): Promise<T> {
  const { url, init } = options;

  const data: T = await fetch(url, init)
    .then((res) => {
      if (res.status === 204) {
        return null;
      }
      return res.json();
    })
    .catch((err) => {
      throw new CustomError(err);
    });

  if (data?.status && data?.status !== 'ok') throw new CustomError(data);
  return data;
}

export async function emitPassportRequest<T extends FortmaticAPIResponse>(options: {
  url: string;
  init?: RequestInit;
}): Promise<T> {
  const { url, init } = options;

  try {
    const response = await fetch(url, init);

    if (response.status === 204) {
      return null as unknown as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new CustomError({
        message: data.detail,
      });
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new CustomError({
        message: error.message,
      });
    }
    throw error;
  }
}
