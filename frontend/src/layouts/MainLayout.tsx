import { Outlet } from "react-router";
import Navbar from "../components/common/NavBar";
import Footer from "../components/common/Footer.tsx";

function MainLayout() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar/>

            <main className="flex-grow-1 bg-light">
                <Outlet/>
            </main>

            <Footer/>
        </div>
    );
}

export default MainLayout;