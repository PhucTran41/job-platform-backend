import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export function validatePasswordStrength(password) {
  const errors = [];

  if (!password) {
    errors.push("Password is required");
  } else {
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Must contain lowercase letter");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Must contain uppercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Must contain number");
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}
