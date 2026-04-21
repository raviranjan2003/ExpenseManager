import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import SignUp from './pages/SignUp.jsx';
import SignIn from './pages/SignIn.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Overview from './pages/dashboard/Overview.jsx';
import Expenses from './pages/dashboard/Expenses.jsx';
import Loans from './pages/dashboard/Loans.jsx';
import Forum from './pages/dashboard/Forum.jsx';
import ForumPost from './pages/dashboard/ForumPost.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="loans" element={<Loans />} />
        <Route path="forum" element={<Forum />} />
        <Route path="forum/:id" element={<ForumPost />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
