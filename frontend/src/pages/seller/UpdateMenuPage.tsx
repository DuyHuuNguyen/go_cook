import {Navigate, useLocation} from "react-router";
import MenuUpdateForm from "../../components/menu/UpdatebleMenuForm.tsx";
import {useMemo} from "react";
import {toMenuInitialData} from "../../clients/MenuClient.tsx";

export default function UpdateMenu(){
    const {state} = useLocation();
    const menu = state?.menu;

    if (!menu) return <Navigate to="/seller/menu-management" replace/>;

    const initialData = useMemo(() => toMenuInitialData(menu), [menu]);
    return (
        <MenuUpdateForm initialData={initialData}/>
    );
}