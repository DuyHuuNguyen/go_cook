import { RouterProvider } from 'react-router'
import { router } from './routers/Router'
import { AppProvider } from './contexts/AppContext'
import {ProfileProvider} from "./contexts/ProfileContext";

function App() {
  return (
    <AppProvider>
        <ProfileProvider>
            <RouterProvider router={router} />
        </ProfileProvider>
    </AppProvider>
  )
}

export default App
