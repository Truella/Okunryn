export interface LoginFormState {
  username: string;
  password: string;
}

export interface LoginFormErrors {
  username?: string;
  password?: string;
}

export function validateLogin(form: LoginFormState): LoginFormErrors {
  const errors: LoginFormErrors = {};
  if (form.username.length < 1) {
    errors.username = "Required";
  }
  if (form.password.length < 1) {
    errors.password = "Required";
  }
  return errors;
}
