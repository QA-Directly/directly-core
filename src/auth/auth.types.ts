export type AuthInput = { email: string; password: string };
export type GoogleData = {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  provider: string;
};
export type FacebookData = {
  provider: string;
  facebookId: string;
  email: string;
  firstName: string;
  lastName: string;
};
