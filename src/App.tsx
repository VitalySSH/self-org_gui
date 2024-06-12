import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks';
import {
    Community,
    MainApp,
    ProtectedRoute,
} from "./components";
import {
    AllCommunities,
    MyCommunities,
    NoMatchPage,
    MyProfile,
    SignIn,
    SignUp,
    Verify2FA,
} from "./pages";


function App() {
      return (
          <AuthProvider>
              <Routes>
                  <Route path='/' element={<MainApp />}
                  >
                      <Route path='communities' element={<AllCommunities />} />
                  </Route>
                  <Route path='/verify-2fa' element={<Verify2FA />} />
                  <Route path='/sign-in' element={<SignIn />} />
                  <Route path='/sign-up' element={<SignUp />} />

                  <Route path='/com/*' element={
                      <ProtectedRoute>
                          <Community />
                      </ProtectedRoute>
                  }>
                      <Route path='all-communities' element={<AllCommunities />} />
                      <Route path='my-communities' element={<MyCommunities />} />
                      <Route path='my-profile' element={<MyProfile />} />
                  </Route>

                  <Route path="*" element={<NoMatchPage />} />

              </Routes>
          </AuthProvider>
      )
}

export default App;
