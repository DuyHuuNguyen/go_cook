import { SellerWorkspace } from "../../components/seller/SellerWorkspace";
import { ChefBookingProvider } from "../../contexts/ChefBookingContext";
import { ChefBookingManagement } from "../../components/seller/ChefBookingManagement";

export function BookingChefManagement() {
  return (
    <SellerWorkspace>
      <ChefBookingProvider>
        <ChefBookingManagement />
      </ChefBookingProvider>
    </SellerWorkspace>
  );
}

export default BookingChefManagement;
