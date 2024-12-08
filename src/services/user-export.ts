import { rawFetch } from '@services/http/magic-rest';

export async function exportUsers(magic_client_id: string, team_id: string) {
  const endpoint = `/v1/dashboard/export/csv?client_id=${magic_client_id}&team_id=${team_id}`;

  try {
    const res = await rawFetch(endpoint);
    if (res.status !== 200) {
      throw new Error('Failed to export user data non 200 response');
    }

    const data = await res.blob();
    return { data };
  } catch (error) {
    return { error };
  }
}
