import * as yup from "yup";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/;

yup.addMethod(yup.string, "email", function validateEmail(message) {
  return this.matches(emailRegex, {
    message,
    name: "email",
    excludeEmptyString: true,
  });
});

export const newuserSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid Email").required("email is required"),
  lName: yup.string().required("Last name is required"),
  // password: yup
  //   .string()
  //   .min(6, "Password length should be minimum 6 characters long")
  //   .max(20, "Password length should not be more than 20 characters long")
  //   .required("password is required")
  //   .matches(
  //     passwordRegex,
  //     "Password must include uppercase,lowercase, number and no spaces"
  //   ),
  password: yup.string().required("password is required"),
});

export const tokenSchema = yup.object({
  id: yup.string().required("id is required"),
  token: yup.string().required("token is required"),
});

export const loginSchema = yup.object({
  email: yup.string().email("Invalid Email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const forgetPasswordSchema = yup.object({
  email: yup.string().email("Invalid Email").required("Email is required"),
});
export const resetpasswordSchema = yup.object({
  id: yup.string().required("id is required"),
  token: yup.string().required("token is required"),
  password: yup.string().required("password is required"),
});
