"use client"

import type React from "react"

import { Eye, EyeOff, Shield, Users } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { useToast } from "@/components/ui/use-toast"
import { authApi } from "@/lib/api"
import { useAuthStore } from "@/lib/store"

export default function LoginPage() {
  const [sewaCode, setSewaCode] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sewaCode || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter valid credentials",
      })
      return
    }

    try {
      setIsLoading(true)

      // For demo purposes, we'll use the sewaCode as email
      // In production, you'd have proper authentication
      const response = await authApi.login(`${sewaCode}@sewa.org`, password)

      login(response.user, response.token)

      toast({
        title: "Login successful",
        description: "Welcome to the Volunteer Attendance System!",
      })

      navigate("/")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
            <h1>Volunteer Attendance System</h1>
            <p>Secure access for Back Office sewadars</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="sewaCode">Sewa Code</label>
              <input
                type="text"
                id="sewaCode"
                placeholder="XX-YYY"
                value={sewaCode}
                onChange={(e) => setSewaCode(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              <Users className="w-4 h-4" />
              {isLoading ? "Accessing..." : "Access System"}
            </button>
          </form>

          <div className="login-footer">
            <p>Authorized personnel only</p>
            <p>Contact IT support for access issues</p>
          </div>
        </div>
      </div>
    </div>
  )
}
