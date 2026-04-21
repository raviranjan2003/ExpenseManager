export function validateEmail(email) {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(String(email).trim());
}

export function validatePassword(password) {
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
}

export function validateRequired(value, label = 'This field') {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${label} is required`;
  }
  return null;
}

export function validateAmount(value) {
  const n = Number(value);
  if (Number.isNaN(n) || n < 0.01) {
    return 'Enter a valid amount (min 0.01)';
  }
  return null;
}
