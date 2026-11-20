import {Navigate, useLocation} from "react-router";
import MenuUpdateForm from "../../components/menu/UpdatebleMenuForm.tsx";
import {useMemo} from "react";
import {toMenuInitialData} from "../../clients/MenuClient.tsx";
import {SellerWorkspace} from "../../components/seller/SellerWorkspace.tsx";

export default function UpdateMenu(){
    const {state} = useLocation();
    const menu = state?.menu;

    if (!menu) return <Navigate to="/seller/menu-management" replace/>;

    const initialData = useMemo(() => toMenuInitialData(menu), [menu]);
    return (
        <SellerWorkspace>
            <MenuUpdateForm initialData={initialData}/>
        </SellerWorkspace>
    );
}