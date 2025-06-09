"use client"

import type React from "react"

import { ArrowLeft, Mail, MapPin, Phone, Save, User } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { useToast } from "../components/ui/use-toast"

import { volunteersApi } from "../lib/api"
import { useVolunteersStore } from "../lib/store"
import { SEWA_AREAS, type SewaAreaCode } from "../types/volunteer"

export default function VolunteerCreatePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    sewaArea: "",
    sewaCode: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { addVolunteer } = useVolunteersStore()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Auto-generate sewa code when area is selected
    if (name === "sewaArea" && value) {
      const existingCodes = [] // In real app, you'd get existing codes for this area
      const nextNumber = String(existingCodes.length + 1).padStart(3, "0")
      setFormData((prev) => ({
        ...prev,
        sewaCode: `${value}-${nextNumber}`,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.phone || !formData.sewaArea) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    try {
      setIsLoading(true)

      const newVolunteer = await volunteersApi.create({
        ...formData,
        sewaArea: formData.sewaArea as SewaAreaCode,
        status: "active",
      })

      addVolunteer(newVolunteer)

      toast({
        title: "Success",
        description: "Volunteer created successfully!",
      })

      navigate("/volunteers")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create volunteer",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/volunteers")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Volunteer</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Volunteer Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number *
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sewaArea" className="text-sm font-medium">
                  Sewa Area *
                </label>
                <select
                  id="sewaArea"
                  name="sewaArea"
                  value={formData.sewaArea}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Sewa Area</option>
                  {Object.entries(SEWA_AREAS).map(([code, name]) => (
                    <option key={code} value={code}>
                      {code} - {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="sewaCode" className="text-sm font-medium">
                  Sewa Code
                </label>
                <Input
                  id="sewaCode"
                  name="sewaCode"
                  type="text"
                  placeholder="Auto-generated based on sewa area"
                  value={formData.sewaCode}
                  onChange={handleInputChange}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  Sewa code will be automatically generated when you select a sewa area
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate("/volunteers")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Creating..." : "Create Volunteer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {formData.name && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{formData.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{formData.phone}</span>
              </div>
              {formData.sewaArea && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>
                    {formData.sewaArea} - {SEWA_AREAS[formData.sewaArea as SewaAreaCode]}
                  </span>
                </div>
              )}
              {formData.sewaCode && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{formData.sewaCode}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
