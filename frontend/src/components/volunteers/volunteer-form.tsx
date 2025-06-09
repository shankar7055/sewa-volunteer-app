"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"

import { volunteersApi } from "@/lib/api"
import { useVolunteersStore } from "@/lib/store"
import type { Volunteer } from "@/types"

// Form validation schema
const volunteerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  availability: z.array(z.string()).min(1, "Select at least one availability option"),
  status: z.enum(["active", "inactive", "pending"]),
})

type VolunteerFormValues = z.infer<typeof volunteerSchema>

// Available skills and availability options
const skillOptions = [
  { id: "teaching", label: "Teaching" },
  { id: "cooking", label: "Cooking" },
  { id: "driving", label: "Driving" },
  { id: "medical", label: "Medical" },
  { id: "technical", label: "Technical" },
  { id: "management", label: "Management" },
  { id: "language", label: "Language Skills" },
  { id: "counseling", label: "Counseling" },
]

const availabilityOptions = [
  { id: "weekday_morning", label: "Weekday Mornings" },
  { id: "weekday_afternoon", label: "Weekday Afternoons" },
  { id: "weekday_evening", label: "Weekday Evenings" },
  { id: "weekend_morning", label: "Weekend Mornings" },
  { id: "weekend_afternoon", label: "Weekend Afternoons" },
  { id: "weekend_evening", label: "Weekend Evenings" },
  { id: "on_call", label: "On Call" },
]

interface VolunteerFormProps {
  volunteer?: Volunteer
  isEdit?: boolean
}

export function VolunteerForm({ volunteer, isEdit = false }: VolunteerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { addVolunteer, updateVolunteer } = useVolunteersStore()

  // Initialize form with default values or existing volunteer data
  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      name: volunteer?.name || "",
      email: volunteer?.email || "",
      phone: volunteer?.phone || "",
      address: volunteer?.address || "",
      skills: volunteer?.skills || [],
      availability: volunteer?.availability || [],
      status: volunteer?.status || "pending",
    },
  })

  // Form submission handler
  const onSubmit = async (data: VolunteerFormValues) => {
    try {
      setIsLoading(true)

      if (isEdit && volunteer) {
        // Update existing volunteer
        const updatedVolunteer = await volunteersApi.update(volunteer.id, data)
        updateVolunteer(volunteer.id, updatedVolunteer)

        toast({
          title: "Volunteer updated",
          description: "Volunteer information has been updated successfully",
        })
      } else {
        // Create new volunteer
        const newVolunteer = await volunteersApi.create(data)
        addVolunteer(newVolunteer)

        toast({
          title: "Volunteer added",
          description: "New volunteer has been added successfully",
        })
      }

      // Navigate back to volunteers list
      navigate("/volunteers")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="(123) 456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="123 Main St, City, State, ZIP" className="min-h-[80px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="skills"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Skills</FormLabel>
                <FormDescription>Select all skills that the volunteer possesses</FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {skillOptions.map((skill) => (
                  <FormField
                    key={skill.id}
                    control={form.control}
                    name="skills"
                    render={({ field }) => {
                      return (
                        <FormItem key={skill.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(skill.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, skill.id])
                                  : field.onChange(field.value?.filter((value) => value !== skill.id))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{skill.label}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="availability"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Availability</FormLabel>
                <FormDescription>Select when the volunteer is available</FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {availabilityOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="availability"
                    render={({ field }) => {
                      return (
                        <FormItem key={option.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, option.id])
                                  : field.onChange(field.value?.filter((value) => value !== option.id))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{option.label}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => navigate("/volunteers")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Volunteer" : "Create Volunteer"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
