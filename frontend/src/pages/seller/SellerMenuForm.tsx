import {SellerWorkspace} from "../../components/seller/SellerWorkspace";
import MenuForm from "../../components/seller/Menu.tsx";

export function SellerMenuForm({editing = false}: { editing?: boolean }) {

    return (
        <SellerWorkspace>
            <MenuForm/>
        </SellerWorkspace>
    )

}
