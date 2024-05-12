import { Routes, Route } from 'react-router-dom';
import { SignIn, SignUp } from './components/auth';
import { AuthProvider } from './hooks';
import { Secret, Verify2FA } from './components/auth';
import {
    MainApp,
    ProtectedRoute,
} from "./components";
import {
    AllCommunities,
    MyCommunities,
    NoMatchPage,
    MyProfile,
} from "./pages";





function App() {
      return (
          <AuthProvider>
              <Routes>
                  <Route path='/verify-2fa' element={<Verify2FA />} />
                  <Route path='/sign-in' element={<SignIn />} />
                  <Route path='/sign-up' element={<SignUp />} />
                  <Route path='/secret' element={<Secret />}/>

                  <Route path='/' element={
                      <ProtectedRoute>
                          <MainApp />
                      </ProtectedRoute>
                  }>
                      <Route path='/all-communities' element={<AllCommunities />} />
                      <Route path='/my-communities' element={<MyCommunities />} />
                      <Route path='/my-profile' element={<MyProfile />} />
                  </Route>

                  <Route path="*" element={<NoMatchPage />} />

              </Routes>

          </AuthProvider>
      )
}

export default App;
