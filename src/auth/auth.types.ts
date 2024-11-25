type AuthInput = { email: string; password: string };
type SignInData = {
  userId: string;
  avatar?: string;
  email: string;
  firstName?: string;
  lastName?: string;
};
type AuthResponse = {
  accessToken: string;
  userId: string;
  email: string;
  lastName?: string;
  firstName?: string;
  avatar?: string;
};
type GoogleData = {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
};
