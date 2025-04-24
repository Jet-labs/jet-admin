import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";

import { CircularProgress } from "@mui/material";
import { useFormik } from "formik";
import logo from "../../../assets/logo.png";
import {
  useAuthActions,
  useAuthState,
} from "../../../logic/contexts/authContext";
import { formValidations } from "../../../utils/formValidation";
const SignInPage = () => {
  const { firebaseUserState, signInState } = useAuthState();
  const { googleSignIn, emailSignIn } = useAuthActions();
  const navigate = useNavigate();

  const emailSignInForm = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: formValidations.emailSignInFormValidationSchema,
    onSubmit: ({ email, password }) => {
      emailSignIn(email, password);
    },
  });

  useEffect(() => {
    if (firebaseUserState.user) {
      navigate(CONSTANTS.ROUTES.HOME.path());
    }
  }, [firebaseUserState]);

  return (
    <div className="bg-slate-50 flex h-screen w-screen flex-col justify-center items-center overflow-hidden">
      <section className=" md:w-2/3 sm:w-full w-full">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="flex flex-row justify-center items-center mb-6">
            <img className=" w-20 h-20 mr-2  " src={logo} alt="logo" />
          </div>

          <div className="w-full bg-white rounded shadow  md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900 md:text-2xl ">
                {CONSTANTS.STRINGS.SIGN_IN_FORM_TITLE}
              </h1>
              <form
                className="space-y-4 md:space-y-6"
                onSubmit={emailSignInForm.handleSubmit}
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-slate-900 "
                  >
                    {CONSTANTS.STRINGS.SIGN_IN_FORM_EMAIL_FIELD_LABEL}
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="bg-slate-50 border border-slate-300 text-slate-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                    placeholder={
                      CONSTANTS.STRINGS.SIGN_IN_FORM_EMAIL_FIELD_PLACEHOLDER
                    }
                    required={true}
                    onChange={emailSignInForm.handleChange}
                    onBlur={emailSignInForm.handleBlur}
                    value={emailSignInForm.values.email}
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-slate-900 "
                  >
                    {CONSTANTS.STRINGS.SIGN_IN_FORM_PASSWORD_FIELD_LABEL}
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="bg-slate-50 border border-slate-300 text-slate-900 rounded focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                    required={true}
                    onChange={emailSignInForm.handleChange}
                    onBlur={emailSignInForm.handleBlur}
                    value={emailSignInForm.values.password}
                  />
                </div>
                {signInState && signInState.isLoading ? (
                  <div className="w-full flex flex-row justify-center items-center">
                    <CircularProgress />
                  </div>
                ) : (
                  <button
                    type="submit"
                    className=" px-3 py-2 w-full text-xs font-medium text-center text-white bg-blue-700 rounded hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 "
                  >
                    {CONSTANTS.STRINGS.SIGN_IN_FORM_SUBMIT_BUTTON}
                  </button>
                )}
                <div className="!w-full justify-center items-center flex flex-row">
                  <span className="w-full text-center text-sm font-medium">
                    Or
                  </span>
                </div>
                <button
                  type="button"
                  onClick={googleSignIn}
                  className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded text-sm px-5 py-1.5 text-center inline-flex justify-center items-center  me-2 mb-2 w-full"
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
                </button>

                {signInState && signInState.error && (
                  <div
                    className="p-4 mb-4 text-sm text-red-800 rounded bg-red-50"
                    role="alert"
                  >
                    <span className="font-medium">Sign in error!</span>
                    {` Please check
                    your credentials and try again!`}
                  </div>
                )}

                <p className="text-sm font-light text-slate-500 ">
                  {CONSTANTS.STRINGS.SIGN_IN_FORM_TO_SIGN_UP_MESSAGE}
                  <Link
                    to={CONSTANTS.ROUTES.SIGN_UP.path()}
                    className="font-medium text-primary-600 hover:underline "
                  >
                    {CONSTANTS.STRINGS.SIGN_UP_FORM_SUBMIT_BUTTON}
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
