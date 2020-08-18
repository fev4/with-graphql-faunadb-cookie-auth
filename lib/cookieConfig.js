export const SECRET_COOKIE_NAME = 'custom_cookie';

export const setCookieConfig = {
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 14 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  path: '/',
};

export const unsetCookieConfig = {
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: -1,
  httpOnly: true,
  path: '/',
};
