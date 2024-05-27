export type User = {
  id: string;
  ssoMode: 'google';
  email: string;
  picture?: string;
  accessToken: string;
  expiryTime: number;
  scope: string;
  authUser: string;
  tokenType: string;
};
