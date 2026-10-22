import {SellerWorkspace} from "../../components/seller/SellerWorkspace";
import MenuForm from "../../components/seller/Menu.tsx";

export function SellerMenuForm({editing = false}: { editing?: boolean }) {

    return (
        <SellerWorkspace
            title={editing ? "Chỉnh sửa thực đơn" : "Thêm thực đơn mới"}
            description="Kể câu chuyện món ăn của bạn bằng hương vị và hình ảnh."
        >
            <MenuForm/>
        </SellerWorkspace>
    )

}
