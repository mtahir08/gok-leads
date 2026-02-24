import * as Yup from 'yup';

export const signinValidationSchema = Yup.object({
  email: Yup.string().email('Invalid email format').required('Required'),
  password: Yup.string().required('Required'),
});

export const forgotPassValidationSchema = Yup.object({
  email: Yup.string().email('Invalid email format').required('Required'),
});

export const resetPassValidationSchema = Yup.object({
  otp: Yup.number()
    .typeError('OTP must be a number')
    .required('OTP is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
    .required('Confirm Password is required'),
});

export const forcedResetPassValidationSchema = Yup.object({
  email: Yup.string().email('Invalid email format').required('Required'),
  tempPass: Yup.string().required('Required'),
  password: Yup.string()
    .required('Required')
    .test(
      'not-same-as-tempPass',
      'New password must not be the same as the temporary password',
      function (value) {
        const { tempPass } = this.parent;
        return value !== tempPass;
      },
    ),
});
