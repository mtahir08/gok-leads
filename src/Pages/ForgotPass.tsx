import EastIcon from '@mui/icons-material/East';
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthActions } from '../Hooks/useAuthActions';
import { forgotPassValidationSchema } from '../schemas/user';

const ForgotPass = () => {
  const { forgot, isLoading } = useAuthActions();
  const theme = useTheme();

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: forgotPassValidationSchema,
    onSubmit: async (values) => {
      const response = await forgot(values);
      if (response?.error) {
        toast.error(response.error);
      } else {
        toast.success('Password reset email sent. Check your inbox.');
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
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant='h5' fontWeight={700} color='text.primary' gutterBottom>
            Forgot Password
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Enter your email and we'll send you a reset OTP.
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
          }}
        >
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                name='email'
                type='email'
                label='Email Address'
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{ '& .MuiInputBase-root': { borderRadius: 1.5 } }}
              />

              <Button
                type='submit'
                variant='contained'
                fullWidth
                disabled={isLoading}
                endIcon={isLoading ? <CircularProgress size={18} color='inherit' /> : <EastIcon />}
                sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem', fontWeight: 600 }}
              >
                {isLoading ? 'Sending...' : 'Send Reset Email'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  to='/'
                  style={{ fontSize: '0.875rem', color: theme.palette.primary.main, textDecoration: 'none' }}
                >
                  Back to Sign In
                </Link>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default ForgotPass;
