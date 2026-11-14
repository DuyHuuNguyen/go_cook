import { Outlet } from "react-router";
import Navbar from "../components/common/NavBar";
import Footer from "../components/common/Footer.tsx";
import { ChatNotificationProvider } from "../contexts/ChatNotificationContext";

function MainLayout() {
    return (
        <ChatNotificationProvider>
            <div className="d-flex flex-column min-vh-100">
                <Navbar/>

                <main className="flex-grow-1 bg-light">
                    <Outlet/>
                </main>

                <Footer/>
            </div>
        </ChatNotificationProvider>
    );
}

export default MainLayout;