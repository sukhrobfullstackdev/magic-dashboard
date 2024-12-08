import { Get, Post, type FortmaticAPIResponse } from '@services/http/magic-rest';

interface GetAccessListsResponse {
  emails: {
    allow_list: string[];
    block_list: string[];
  };
}

interface ValidateAccessListsBody {
  magic_client_id: string;
  emails: {
    allow_list: string[];
    block_list: string[];
  };
}

interface ValidateAccessListsResponse {
  invalid_emails: {
    allow_list: string[];
    block_list: string[];
  };
}

const USE_MOCK_DATA = false;

// Mock Login Access Service Interactions
function isEmailOrDomain(text: string) {
  const regexEmail = /((^\w+([\.-]?\w+)*)|(^\*))@\w+([\.-]?\w+)*(\.\w{2,4})+$/gm;
  if (text.match(regexEmail)) {
    return true;
  }
  return false;
}

let al = [
  'hiro@magic.link',
  'dh@magic.link',
  'ian@magic.link',
  'sean@magic.link',
  'dheeban@magic.link',
  'jerry@magic.link',
];
let bl: string[] = [];

async function mockUpdateAccessLists(magic_client_id: string, allow_list: string[], block_list: string[]) {
  const allowListValids: string[] = [];
  const blockListValids: string[] = [];
  allow_list?.forEach((entry) => {
    if (entry && isEmailOrDomain(entry)) allowListValids.push(entry);
  });
  block_list?.forEach((entry) => {
    if (entry && isEmailOrDomain(entry)) blockListValids.push(entry);
  });
  al = allowListValids;
  bl = blockListValids;
  return Promise.resolve();
}

async function mockValidateAccessLists(magic_client_id: string, allow_list: string[], block_list: string[]) {
  const ali: string[] = [];
  const bli: string[] = [];

  allow_list?.forEach((entry) => {
    if (entry && !isEmailOrDomain(entry)) ali.push(entry);
  });

  block_list?.forEach((entry) => {
    if (entry && !isEmailOrDomain(entry)) bli.push(entry);
  });

  return Promise.resolve({
    invalid_emails: {
      allow_list: ali,
      block_list: bli,
    },
  });
}

async function mockGetAccessLists() {
  return Promise.resolve({ emails: { allow_list: al, block_list: bl } });
}

// End of Mock Functions

export async function updateAccessLists(magic_client_id: string, allow_list: string[], block_list: string[]) {
  const endpoint = 'v1/dashboard/magic_dashboard/access_control/update';
  const body = { magic_client_id, emails: { allow_list, block_list } };
  if (USE_MOCK_DATA) return mockUpdateAccessLists(magic_client_id, allow_list, block_list);
  return (await Post(endpoint, body)).data;
}

export async function getAccessLists(magic_client_id: string) {
  const endpoint = `v1/dashboard/magic_dashboard/access_control?magic_client_id=${magic_client_id}`;
  if (USE_MOCK_DATA) return mockGetAccessLists();
  return (await Get<FortmaticAPIResponse<GetAccessListsResponse>>(endpoint)).data;
}

export async function validateAccessLists(magic_client_id: string, allow_list: string[], block_list: string[]) {
  const endpoint = 'v1/dashboard/magic_dashboard/access_control/validate';
  const body = { magic_client_id, emails: { allow_list, block_list } };
  if (USE_MOCK_DATA) return mockValidateAccessLists(magic_client_id, allow_list, block_list);
  return (await Post<ValidateAccessListsBody, FortmaticAPIResponse<ValidateAccessListsResponse>>(endpoint, body)).data;
}
