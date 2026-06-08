export type SuggestUsernameRequestType = {
  userName: string;
  hint?: string;
}

export type SuggestUsernameResponseType = {
  usernames: string[];
  message: string;
  status: boolean;
}

// export async function suggestUsername(data: ISuggestUsernamePayload): Promise<ISuggestUsernameResponse>  {
//   const params = new URLSearchParams();
//   params.append("userName", data.userName);
//   if (data.hint) params.append("hint", data.hint);
//   return apiRequest(`/api/auth/suggest-username?${params.toString()}`, "POST");
// }