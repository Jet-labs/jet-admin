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
import { Button, Spinner, Input, cn, Section } from "@jet-admin/ui";
const SignInPage = () => {
  const { firebaseUserState, signUpState } = useAuthState();
  const { emailSignUp,googleSignIn } = useAuthActions();
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
    <div className="bg-background flex h-screen w-screen flex-col justify-center items-center overflow-hidden">
      <section className=" md:w-1/3 sm:w-2/3 ">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="flex flex-row justify-center items-center mb-6">
            <img className=" w-8 h-8 mr-2  " src={logo} alt="logo" />
            <span className="ml-2 text-lg leading-none font-bold whitespace-nowrap text-primary aldrich-logo">
              {CONSTANTS.APP_NAME}
            </span>
          </div>
          <Section
            title={CONSTANTS.STRINGS.SIGN_UP_FORM_TITLE}
            className="w-full sm:max-w-md"
          >
            <form
              className="space-y-3 md:space-y-4"
              onSubmit={emailSignUpForm.handleSubmit}
            >
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-1 text-sm font-medium text-foreground "
                  >
                    {CONSTANTS.STRINGS.SIGN_UP_FORM_EMAIL_FIELD_LABEL}
                  </label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    className="w-full"
                    placeholder={
                      CONSTANTS.STRINGS.SIGN_UP_FORM_EMAIL_FIELD_PLACEHOLDER
                    }
                    required={true}
                    onChange={emailSignUpForm.handleChange}
                    onBlur={emailSignUpForm.handleBlur}
                    value={emailSignUpForm.values.email}
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-1 text-sm font-medium text-foreground "
                  >
                    {CONSTANTS.STRINGS.SIGN_UP_FORM_PASSWORD_FIELD_LABEL}
                  </label>
                  <Input
                    type="password"
                    name="password"
                    id="password"
                    className={cn(
                      "w-full",
                      emailSignUpForm.errors.password && "!border-red-400"
                    )}
                    placeholder=""
                    required={true}
                    onChange={emailSignUpForm.handleChange}
                    onBlur={emailSignUpForm.handleBlur}
                    value={emailSignUpForm.values.password}
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block mb-1 text-sm font-medium text-foreground "
                  >
                    {
                      CONSTANTS.STRINGS
                        .SIGN_UP_FORM_CONFIRM_PASSWORD_FIELD_LABEL
                    }
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className={cn(
                      "w-full",
                      emailSignUpForm.errors.confirmPassword && "!border-red-400"
                    )}
                    placeholder=""
                    required={true}
                    onChange={emailSignUpForm.handleChange}
                    onBlur={emailSignUpForm.handleBlur}
                    value={emailSignUpForm.values.confirmPassword}
                  />
                </div>
                {signUpState && signUpState.isLoading ? (
                  <div className="w-full flex flex-row justify-center items-center mt-3">
                    <Spinner className="text-primary" size={16} />
                  </div>
                ) : (
                  <Button
                    type="submit"
                      className="w-full"
                  >
                    {CONSTANTS.STRINGS.SIGN_UP_FORM_SUBMIT_BUTTON}
                  </Button>
                )}

                <div className="py-3 flex items-center text-sm text-foreground before:flex-1 before:border-t before:border-border before:me-6 after:flex-1 after:border-t after:border-border after:ms-6">
                  Or
                </div>
                <Button
                  type="button"
                  onClick={googleSignIn}
                  className="text-foreground bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-sm text-sm px-5 py-1.5 text-center inline-flex justify-center items-center  me-2 mb-2 w-full"
                >
                  <svg
                    className="w-4 h-4 me-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 19"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {CONSTANTS.STRINGS.SIGN_IN_FORM_GOOGLE_SIGN_IN_LABEL}
                </Button>

                {signUpState && signUpState.error && (
                  <div
                    className="p-4 mb-4 text-sm text-red-400 rounded-sm bg-red-950/40 "
                    role="alert"
                  >
                    <span className="font-medium">Sign up error!</span>
                    {JSON.stringify(signUpState.error)}
                  </div>
                )}

                <p className="text-sm font-light text-foreground ">
                  {CONSTANTS.STRINGS.SIGN_UP_FORM_TO_SIGN_IN_MESSAGE}
                  <Link
                    to={CONSTANTS.ROUTES.SIGN_IN.path()}
                    className="font-medium text-primary-600 hover:underline ml-2"
                  >
                    {CONSTANTS.STRINGS.SIGN_IN_FORM_SUBMIT_BUTTON}
                  </Link>
                </p>
              </form>
          </Section>
        </div>
      </section>
    </div>
  );
};

export default SignInPage;
