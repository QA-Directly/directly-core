type AuthInput = { email: string; password: string };
type SignInData = {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
};
type AuthResponse = {
  userId?: string;
  accessToken: string;
  googleId?: string;
  email: string;
  lastName?: string;
  firstName?: string;
  avatar?: string;
  facebookId?: string;
};
type GoogleData = {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  provider: string;
};
type FacebookData = {
  provider: string;
  facebookId: string;
  email: string;
  firstName: string;
  lastName: string;
};
