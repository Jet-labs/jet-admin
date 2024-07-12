import {
  AppBar,
  Button,
  CircularProgress,
  TextField,
  Toolbar,
} from "@mui/material";
import { Formik } from "formik";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { ErrorComponent } from "../../components/ErrorComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { useAuthActions, useAuthState } from "../../contexts/authContext";
import "./styles.css";

const LoginForm = ({}) => {
  const { isLogingIn, loginError } = useAuthState();
  const { login } = useAuthActions();
  return (
    <div className="flex flex-col items-start p-4 mt-20 lg:w-1/3 md:w-1/2  w-full">
      <span className="font font-bold text-3xl w-4/5 mb-2 text-start">
        Sign In
      </span>
      <span className="!font-thin text-justify text-sm w-full mb-2 mt-2">
        Please enter details to begin.
      </span>
      <Formik
        initialValues={{ username: "local_admin", password: "password" }}
        validate={(values) => {
          const errors = {};
          if (!values.username) {
            errors.username = "Required";
          } else if (!values.password) {
            errors.password = "Required";
          }
          return errors;
        }}
        onSubmit={(values) => {
          login({ username: values.username, password: values.password });
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          /* and other goodies */
        }) => (
          <form
            onSubmit={handleSubmit}
            style={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <TextField
              label={errors.username ? errors.username : "Username"}
              placeholder="Enter your phone here"
              type={"tel"}
              name="username"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.username}
              error={Boolean(errors.username)}
              size="small"
              fullWidth
            />
            <TextField
              label={errors.password ? errors.password : "Password"}
              placeholder="Enter your phone here"
              className="!mt-5"
              type={"text"}
              name="password"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
              error={Boolean(errors.password)}
              size="small"
              fullWidth
            />

            <Button
              disableElevation
              variant="contained"
              size="small"
              type="submit"
              startIcon={
                isLogingIn && <CircularProgress color="inherit" size={12} />
              }
              className="!mt-4"
              fullWidth
            >
              Login
            </Button>
          </form>
        )}
      </Formik>
      {loginError && (
        <ErrorComponent error={loginError} style={{ marginTop: 6 }} />
      )}
    </div>
  );
};

/**
 *
 * @param {object} param0
 * @returns
 */
const SignIn = ({}) => {
  const { pmUser } = useAuthState();

  let navigate = useNavigate();
  React.useEffect(() => {
    if (pmUser) {
      navigate("/", { replace: true });
    }
  }, [pmUser]);

  return (
    <div className="signin_main">
      <AppBar position="sticky" className="!bg-transparent" elevation={0}>
        <Toolbar className="!mt-2">
          <img src={logo} className="mr-2 !h-10 !w-10"></img>
          <span className="font-bold text-lg flex-grow ">
            {LOCAL_CONSTANTS.APP_NAME}
          </span>
        </Toolbar>
      </AppBar>

      <LoginForm />
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default SignIn;
