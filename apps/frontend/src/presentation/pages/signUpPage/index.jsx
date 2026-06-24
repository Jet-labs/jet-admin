import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import {
  useAuthActions,
  useAuthState,
} from "../../../logic/hooks/useAuth";
import { useFormik } from "formik";
import logo from "../../../assets/logo.png";
import { formValidations } from "../../../utils/formValidation";
import { Button, Spinner, Input, cn } from "@jet-admin/ui";

const GoogleIcon = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z" />
  </svg>
);

const SignUpPage = () => {
  const { firebaseUserState, signUpState } = useAuthState();
  const { emailSignUp, googleSignIn } = useAuthActions();
  const navigate = useNavigate();

  const emailSignUpForm = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: formValidations.emailSignUpFormValidationSchema,
    onSubmit: ({ email, password }) => {
      emailSignUp(email, password);
    },
  });

  useEffect(() => {
    if (firebaseUserState.user) {
      navigate(CONSTANTS.ROUTES.HOME.path());
    }
  }, [firebaseUserState]);

  return (
    <div className="bg-background flex items-center justify-center min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center space-x-1.5">
            <img className="h-7 w-7" src={logo} alt="logo" />
            <p className="font-medium text-lg text-foreground dark:text-foreground aldrich-logo">
              {CONSTANTS.APP_NAME}
            </p>
          </div>
          <h3 className="mt-6 text-xl font-semibold text-foreground dark:text-foreground">
            {CONSTANTS.STRINGS.SIGN_UP_FORM_TITLE}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
            {CONSTANTS.STRINGS.SIGN_UP_FORM_TO_SIGN_IN_MESSAGE}{" "}
            <Link
              to={CONSTANTS.ROUTES.SIGN_IN.path()}
              className="font-medium text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90"
            >
              {CONSTANTS.STRINGS.SIGN_IN_FORM_SUBMIT_BUTTON}
            </Link>
          </p>
          
          <div className="mt-8 flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button
              type="button"
              onClick={googleSignIn}
              className="flex-1 flex items-center justify-center space-x-2 py-2 w-full bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground shadow-xs"
            >
              <GoogleIcon className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">{CONSTANTS.STRINGS.SIGN_IN_FORM_GOOGLE_SIGN_IN_LABEL}</span>
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <form onSubmit={emailSignUpForm.handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block mb-1 text-sm font-medium text-foreground dark:text-foreground"
              >
                {CONSTANTS.STRINGS.SIGN_UP_FORM_EMAIL_FIELD_LABEL}
              </label>
              <Input
                type="email"
                name="email"
                id="email"
                className="mt-2 w-full"
                placeholder={CONSTANTS.STRINGS.SIGN_UP_FORM_EMAIL_FIELD_PLACEHOLDER}
                required={true}
                onChange={emailSignUpForm.handleChange}
                onBlur={emailSignUpForm.handleBlur}
                value={emailSignUpForm.values.email}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-medium text-foreground dark:text-foreground"
              >
                {CONSTANTS.STRINGS.SIGN_UP_FORM_PASSWORD_FIELD_LABEL}
              </label>
              <Input
                type="password"
                name="password"
                id="password"
                className={cn("mt-2 w-full", emailSignUpForm.errors.password && "!border-red-400")}
                placeholder="********"
                required={true}
                onChange={emailSignUpForm.handleChange}
                onBlur={emailSignUpForm.handleBlur}
                value={emailSignUpForm.values.password}
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block mb-1 text-sm font-medium text-foreground dark:text-foreground"
              >
                {CONSTANTS.STRINGS.SIGN_UP_FORM_CONFIRM_PASSWORD_FIELD_LABEL}
              </label>
              <Input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                className={cn("mt-2 w-full", emailSignUpForm.errors.confirmPassword && "!border-red-400")}
                placeholder="********"
                required={true}
                onChange={emailSignUpForm.handleChange}
                onBlur={emailSignUpForm.handleBlur}
                value={emailSignUpForm.values.confirmPassword}
              />
            </div>

            {signUpState && signUpState.isLoading ? (
              <div className="w-full flex flex-row justify-center items-center py-2 mt-4">
                <Spinner className="text-primary" size={16} />
              </div>
            ) : (
              <Button type="submit" className="mt-4 w-full py-2 font-medium">
                {CONSTANTS.STRINGS.SIGN_UP_FORM_SUBMIT_BUTTON}
              </Button>
            )}

            {signUpState && signUpState.error && (
              <div
                className="mt-4 p-4 text-sm text-red-400 rounded-sm bg-red-950/40"
                role="alert"
              >
                <span className="font-medium">Sign up error!</span>
                {` ` + JSON.stringify(signUpState.error)}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
