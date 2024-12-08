import { Post } from '@services/http/magic-rest';

export async function editQuickstartConfig(
  magic_client_id: string,
  checklist_status: {
    is_quickstart_complete: boolean;
  },
) {
  const endpoint = 'v1/dashboard/magic_client/edit';
  const body = { magic_client_id, checklist_status };
  return Post(endpoint, body);
}
