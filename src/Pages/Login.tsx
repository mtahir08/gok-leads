import EastIcon from '@mui/icons-material/East';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthActions } from '../Hooks/useAuthActions';
import { signinValidationSchema } from '../schemas/user';

const Login = () => {
  const { login, isLoading } = useAuthActions();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: signinValidationSchema,
    onSubmit: async (values) => {
      const response = await login(values);
      if (response?.error) {
        toast.error(response.error);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Logo / Brand */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2.5,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
            }}
          >
            <Typography variant='h5' fontWeight={800} color='white'>
              G
            </Typography>
          </Box>
          <Typography variant='h4' fontWeight={700} color='text.primary' gutterBottom>
            GOK Leads
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Sign in to your account to continue
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: `0 4px 32px ${alpha(theme.palette.common.black, 0.06)}`,
          }}
        >
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant='body2' fontWeight={600} color='text.primary' sx={{ mb: 1 }}>
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  name='email'
                  type='email'
                  placeholder='you@example.com'
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  sx={{
                    '& .MuiInputBase-root': { borderRadius: 1.5, fontSize: '16px' },
                    '& .MuiInputBase-input': { py: 1.5 },
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant='body2' fontWeight={600} color='text.primary'>
                    Password
                  </Typography>
                  <Link
                    to='/forgot-password'
                    style={{
                      fontSize: '0.8rem',
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>
                <TextField
                  fullWidth
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          onClick={() => setShowPassword(!showPassword)}
                          edge='end'
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': { borderRadius: 1.5, fontSize: '16px' },
                    '& .MuiInputBase-input': { py: 1.5 },
                  }}
                />
              </Box>

              <Divider sx={{ my: 0.5 }} />

              <Button
                type='submit'
                variant='contained'
                fullWidth
                disabled={isLoading}
                endIcon={isLoading ? <CircularProgress size={18} color='inherit' /> : <EastIcon />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
