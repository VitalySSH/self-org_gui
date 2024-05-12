import { Route, Routes } from "react-router-dom";
import {
    AllCommunities,
    MyCommunities,
    MyProfile,
} from "../../pages";


export function MainAppRoutes() {
    return (
        <Routes>
            <Route path='/all-communities' element={<AllCommunities />} />
            <Route path='/my-communities' element={<MyCommunities />} />
            <Route path='/my-profile' element={<MyProfile />} />
        </Routes>
    );
}
