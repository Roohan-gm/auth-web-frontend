export const googleApi = () => {
  const clientId   = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
  const redirect   = `${process.env.NEXT_PUBLIC_API_URL}/google`;
  const scope      = "openid email profile";
  const authUrl    =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirect)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}`;

  window.location.href = authUrl;
};