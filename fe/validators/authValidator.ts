function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

function isNonEmptyString(value: string): boolean {
  return value.trim().length > 0;
}

export { isValidEmail, isValidPassword, isNonEmptyString };