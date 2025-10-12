import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import GlobalNotification from './components/GlobalNotification';
import Header from './components/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import DiaryPage from './pages/DiaryTest';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app app-bg">
          <GlobalNotification />
          <Header />
          <main>
            <Routes>
              {/* 공개 페이지 (로그인하지 않은 사용자만) */}
              <Route
                path="/auth"
                element={
                  <PublicOnlyRoute>
                    <Auth />
                  </PublicOnlyRoute>
                }
              />

              {/* 보호된 페이지 (로그인 필요) */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* 홈 페이지 */}
              <Route path="/" element={<Home />} />

              {/* 404 페이지 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
