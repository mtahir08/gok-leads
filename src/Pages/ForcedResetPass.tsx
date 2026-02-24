import { ErrorMessage, Field, Form, Formik } from 'formik';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  useTheme,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { toast } from 'react-toastify';
import { useAuthActions } from '../Hooks/useAuthActions';
import { resetPassInitialValues } from '../initialValues/user';
import { forcedResetPassValidationSchema } from '../schemas/user';
import { useState } from 'react';

const ForcedResetPass = () => {
  const { forcedReset, isLoading } = useAuthActions();
  const theme = useTheme();
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (values: any) => {
    const response = await forcedReset(values);
    if (response?.error) {
      toast.error(response.error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        {/* Logo and Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            mb: 1.5,
          }}
        >
          <Box
            component='img'
            src='/logo.svg'
            alt='logo'
            sx={{ width: 40, height: 40 }}
          />
          <Typography
            variant='h5'
            sx={{
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            GOK Leads
          </Typography>
        </Box>

        <Typography
          variant='body2'
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            mb: 3,
            fontSize: '0.875rem',
          }}
        >
          Reset your password to continue.
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Formik
            initialValues={resetPassInitialValues}
            validationSchema={forcedResetPassValidationSchema}
            onSubmit={onSubmit}
          >
            {({ values, handleChange, errors, touched }) => (
              <Form>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography
                      variant='body2'
                      sx={{
                        mb: 0.75,
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '0.875rem',
                      }}
                    >
                      Email
                    </Typography>
                    <Field
                      as={TextField}
                      type='email'
                      name='email'
                      fullWidth
                      size='small'
                      value={values.email}
                      onChange={handleChange}
                      error={touched.email && Boolean(errors.email)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                        },
                      }}
                    />
                    <ErrorMessage name='email'>
                      {(msg) => (
                        <Typography
                          variant='caption'
                          sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, display: 'block' }}
                        >
                          {msg}
                        </Typography>
                      )}
                    </ErrorMessage>
                  </Box>

                  <Box>
                    <Typography
                      variant='body2'
                      sx={{
                        mb: 0.75,
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '0.875rem',
                      }}
                    >
                      Temporary Password
                    </Typography>
                    <Field
                      as={TextField}
                      type={showTempPassword ? 'text' : 'password'}
                      name='tempPass'
                      fullWidth
                      size='small'
                      value={values.tempPass}
                      onChange={handleChange}
                      error={touched.tempPass && Boolean(errors.tempPass)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              size='small'
                              onClick={() => setShowTempPassword(!showTempPassword)}
                              edge='end'
                            >
                              {showTempPassword ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                        },
                      }}
                    />
                    <ErrorMessage name='tempPass'>
                      {(msg) => (
                        <Typography
                          variant='caption'
                          sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, display: 'block' }}
                        >
                          {msg}
                        </Typography>
                      )}
                    </ErrorMessage>
                  </Box>

                  <Box>
                    <Typography
                      variant='body2'
                      sx={{
                        mb: 0.75,
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '0.875rem',
                      }}
                    >
                      New Password
                    </Typography>
                    <Field
                      as={TextField}
                      type={showPassword ? 'text' : 'password'}
                      name='password'
                      fullWidth
                      size='small'
                      value={values.password}
                      onChange={handleChange}
                      error={touched.password && Boolean(errors.password)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              size='small'
                              onClick={() => setShowPassword(!showPassword)}
                              edge='end'
                            >
                              {showPassword ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                        },
                      }}
                    />
                    <ErrorMessage name='password'>
                      {(msg) => (
                        <Typography
                          variant='caption'
                          sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, display: 'block' }}
                        >
                          {msg}
                        </Typography>
                      )}
                    </ErrorMessage>
                  </Box>

                  <Button
                    type='submit'
                    variant='contained'
                    fullWidth
                    disabled={isLoading}
                    sx={{
                      mt: 1,
                      py: 1.25,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: theme.shadows[1],
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Box>
  );
};

export default ForcedResetPass;
