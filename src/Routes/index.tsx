import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Documents from '../Pages/Documents';
import ForcedResetPass from '../Pages/ForcedResetPass';
import ForgotPass from '../Pages/ForgotPass';
import Login from '../Pages/Login';
import PdfToExcel from '../Pages/PdfToExcel';
import ResetPass from '../Pages/ResetPass';
import ProtectedRoutes from './ProtectedRoutes';
import PublicRoutes from './PublicRoutes';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<PublicRoutes />}>
          <Route path='' element={<Login />} />
          <Route path='forgot-password' element={<ForgotPass />} />
          <Route path='reset-password' element={<ResetPass />} />
          <Route path='reset' element={<ForcedResetPass />} />
          <Route path='*' element={<Navigate to='/' />} />
        </Route>

        {/* Protected routes */}
        <Route path='/' element={<ProtectedRoutes />}>
          <Route path='documents' element={<Documents />} />
          <Route path='pdf-to-excel' element={<PdfToExcel />} />
          <Route path='*' element={<Navigate to='/documents' />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
