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
    Verify2FA, NewCommunity,
} from "./pages";


function App() {
      return (
          <AuthProvider>
              <Routes>
                  <Route path='/' element={<MainApp />}
                  >
                      <Route path='communities' element={
                          <ProtectedRoute>
                              <AllCommunities />
                          </ProtectedRoute>
                      } />
                      <Route path='my-communities' element={
                          <ProtectedRoute>
                            <MyCommunities />
                          </ProtectedRoute>
                      } />
                      <Route path='/new-community' element={
                          <ProtectedRoute>
                            <NewCommunity/>
                          </ProtectedRoute>
                      } />
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
