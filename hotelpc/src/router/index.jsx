import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
const Home = lazy(() => import('../pages/Home.jsx'))
const Login = lazy(() => import('../pages/Login.jsx'))
const Signup = lazy(() => import('../pages/Signup.jsx'))
const HotelInfo = lazy(() => import('../pages/HotelInfo.jsx'))
const Admin = lazy(() => import('../pages/Admin.jsx'))

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      color: 'var(--text-muted)'
    }}>
      <p>加载中...</p>
    </div>
  )
}

function AppRoutes() {
    return (
      // Suspense 用于处理懒加载组件的加载状态
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* 首页 */}
          <Route path="/home" element={<Home />} />
          <Route path="/hotel-info" element={<HotelInfo />} />
          <Route path="/hotel-info/:id" element={<HotelInfo />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<Login />} >
          <Route path="signup" element={<Signup />} />
          </Route>

        </Routes>
      </Suspense>
    )
  }
  
  export default AppRoutes
  
  