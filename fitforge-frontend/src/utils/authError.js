export function getAuthErrorMessage(error, fallback) {
  const data = error?.response?.data;
  const message = data?.message || data?.detail || data?.error;

  if (message) return message;
  if (error?.response?.status === 409) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return 'Email or password is incorrect. Check your details or create an account.';
  }
  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return 'Cannot reach the FitForge backend. Make sure Spring Boot is running on port 8080.';
  }
  return fallback;
}
