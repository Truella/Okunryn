export interface RegisterFormState {
  username: string;
  displayName: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormErrors {
  username?: string;
  displayName?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateRegister(form: RegisterFormState): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (form.username.length < 3) {
    errors.username = "At least 3 characters";
  } else if (form.username.length > 32) {
    errors.username = "Maximum 32 characters";
  } else if (!/^[a-z0-9_-]+$/.test(form.username)) {
    errors.username = "Lowercase letters, numbers, _ and - only";
  }

  if (form.displayName.length < 1) {
    errors.displayName = "Required";
  } else if (form.displayName.length > 128) {
    errors.displayName = "Maximum 128 characters";
  }

  if (form.password.length < 8) {
    errors.password = "At least 8 characters";
  } else if (form.password.length > 128) {
    errors.password = "Maximum 128 characters";
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Passwords don't match";
  }

  return errors;
}
