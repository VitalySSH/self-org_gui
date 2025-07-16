import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks';
import { CommunityWorkSpace, MainApp, ProtectedRoute } from './components';
import { NoMatchPage, SignIn, SignUp, Verify2FA } from './pages';
import { ThemeProvider } from 'src/contexts/ThemeContext.tsx';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Routes>
        <Route path="/*" element={<MainApp />} />
        <Route path="/verify-2fa" element={<Verify2FA />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />

        <Route
          path="my-communities/:id/*"
          element={
            <ProtectedRoute>
              <CommunityWorkSpace />
            </ProtectedRoute>
          }
        ></Route>

        <Route path="/no-much-page" element={<NoMatchPage />} />
      </Routes>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
