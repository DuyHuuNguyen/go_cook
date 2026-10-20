import { useSearchParams } from "react-router";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { SellerMenuForm } from "./SellerMenuForm";
export function SellerProductEditPage() {
  useDocumentTitle("Chỉnh sửa thực đơn | GO Cook");
  const [params] = useSearchParams();
  return <SellerMenuForm key={params.get("id")} editing />;
}
