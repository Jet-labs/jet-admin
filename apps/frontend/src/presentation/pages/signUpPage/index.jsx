import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import {
  useAuthActions,
  useAuthState,
} from "../../../logic/contexts/authContext";
import { useFormik } from "formik";
import logo from "../../../assets/logo.png";
import { formValidations } from "../../../utils/formValidation";
import { CircularProgress } from "@mui/material";
const SignInPage = () => {
  const { firebaseUserState, signUpState } = useAuthState();
  const { emailSignUp } = useAuthActions();
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
    <div className="bg-slate-50 flex h-screen w-screen flex-col justify-center items-center overflow-hidden">
      <section className=" md:w-1/3 sm:w-2/3 ">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="flex flex-row justify-center items-center mb-6">
            <img className=" w-20 h-20 mr-2  " src={logo} alt="logo" />
          </div>
          <div className="w-full bg-white rounded shadow  md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900 md:text-2xl ">
                {CONSTANTS.STRINGS.SIGN_UP_FORM_TITLE}
              </h1>
              <form
                className="space-y-4 md:space-y-6"
                onSubmit={emailSignUpForm.handleSubmit}
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-slate-900 "
                  >
                    {CONSTANTS.STRINGS.SIGN_UP_FORM_EMAIL_FIELD_LABEL}
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="bg-slate-50 border border-slate-300 text-slate-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
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
                    className="block mb-2 text-sm font-medium text-slate-900 "
                  >
                    {CONSTANTS.STRINGS.SIGN_UP_FORM_PASSWORD_FIELD_LABEL}
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className={`bg-slate-50 border border-slate-300 text-slate-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 ${
                      emailSignUpForm.errors.password ? "!border-red-400" : ""
                    }`}
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
                    className="block mb-2 text-sm font-medium text-slate-900 "
                  >
                    {
                      CONSTANTS.STRINGS
                        .SIGN_UP_FORM_CONFIRM_PASSWORD_FIELD_LABEL
                    }
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className={`bg-slate-50 border border-slate-300 text-slate-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 ${
                      emailSignUpForm.errors.confirmPassword
                        ? "!border-red-400"
                        : ""
                    }`}
                    placeholder=""
                    required={true}
                    onChange={emailSignUpForm.handleChange}
                    onBlur={emailSignUpForm.handleBlur}
                    value={emailSignUpForm.values.confirmPassword}
                  />
                </div>
                {signUpState && signUpState.isLoading ? (
                  <div className="w-full flex flex-row justify-center items-center">
                    <CircularProgress />
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="px-3 py-2 w-full text-xs font-medium text-center text-white bg-blue-700 rounded hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 "
                  >
                    {CONSTANTS.STRINGS.SIGN_UP_FORM_SUBMIT_BUTTON}
                  </button>
                )}

                {signUpState && signUpState.error && (
                  <div
                    className="p-4 mb-4 text-sm text-red-800 rounded bg-red-50 "
                    role="alert"
                  >
                    <span className="font-medium">Sign up error!</span>
                    {JSON.stringify(signUpState.error)}
                  </div>
                )}

                <p className="text-sm font-light text-slate-500 ">
                  {CONSTANTS.STRINGS.SIGN_UP_FORM_TO_SIGN_IN_MESSAGE}
                  <Link
                    to={CONSTANTS.ROUTES.SIGN_IN.path()}
                    className="font-medium text-primary-600 hover:underline "
                  >
                    {CONSTANTS.STRINGS.SIGN_IN_FORM_SUBMIT_BUTTON}
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignInPage;
