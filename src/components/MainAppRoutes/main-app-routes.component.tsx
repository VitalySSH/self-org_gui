import { Route, Routes } from "react-router-dom";
import {
    AllCommunities,
    MyCommunities,
    MyProfile,
} from "../../pages";


export function MainAppRoutes() {
    return (
        <Routes>
            <Route path='t/all-communities' element={<AllCommunities />} />
            <Route path='t/my-communities' element={<MyCommunities />} />
            <Route path='t/my-profile' element={<MyProfile />} />
        </Routes>
    );
}
