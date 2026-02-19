import AppRoutes from './router/index.jsx'
import { HotelProvider } from './context/HotelContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <HotelProvider>
        <div><AppRoutes /></div>
      </HotelProvider>
    </AuthProvider>
  )
}

export default App
