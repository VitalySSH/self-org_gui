import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks';
import {
    Community,
    MainApp,
    ProtectedRoute,
} from "./components";
import {
    SignIn,
    SignUp,
    Verify2FA,
} from "./pages";

function App() {
      return (
          <AuthProvider>
              <Routes>
                  <Route path='/*' element={<MainApp />}/>
                  <Route path='/verify-2fa' element={<Verify2FA />} />
                  <Route path='/sign-in' element={<SignIn />} />
                  <Route path='/sign-up' element={<SignUp />} />

                  <Route path='my-communities/:id/*' element={
                      <ProtectedRoute>
                          <Community />
                      </ProtectedRoute>
                  }>
                  </Route>

              </Routes>
          </AuthProvider>
      )
}

export default App;
