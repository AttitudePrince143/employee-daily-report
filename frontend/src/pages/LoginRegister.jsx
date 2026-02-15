import { useState } from "react"
import API from "../api/axios" // use your axios instance
import { useNavigate } from "react-router-dom"

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isLogin) {
        // LOGIN
        const res = await API.post("/auth/login", { email, password })
        localStorage.setItem("token", res.data.token)

        // Decode role from token
        const payload = JSON.parse(atob(res.data.token.split(".")[1]))
        if (payload.role === "admin") navigate("/admin")
        else navigate("/employee")
      } else {
        // REGISTER
        await API.post("/auth/register", { name, email, password })
        setMessage("Registration successful! Wait for admin approval.")
        setIsLogin(true)
      }
    } catch (err) {
      if (err.response) setMessage(err.response.data.message)
      else setMessage("Server error")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-indigo-500 to-purple-500 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          {isLogin ? "Login" : "Register"}
        </h2>

        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded">
            {message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            className="text-indigo-600 cursor-pointer hover:underline"
            onClick={() => {
              setIsLogin(!isLogin)
              setMessage("")
            }}
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  )
}
