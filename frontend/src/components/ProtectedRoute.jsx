import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ allowedRole, children }) {
  const token = localStorage.getItem("token")
  if (!token) return <Navigate to="/" />

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const role = payload.role

    if (role !== allowedRole) return <Navigate to="/" />
    return children
  } catch {
    return <Navigate to="/" />
  }
}
