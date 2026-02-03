"use client"

import type React from "react"
import {
  Mail,
  ShieldCheck,
  CalendarClock,
  LogIn,
  Users,
  ImageIcon,
  KeyRound,
  Globe,
} from "lucide-react"

import Avatar from "./Avatar"
import AvatarUpload from "./AvatarUpload"
import DeleteAccount from "./DeleteAccount"

interface Profile {
  id: string
  email: string
  role: string
  email_confirmed_at: string | null
  created_at: string
  last_sign_in_at: string
  app_metadata: { providers?: string[] }
}

interface ProfileCardProps {
  profile: Profile
  displayName: string
  roleLabel: string
}

export default function ProfileCard({ profile, displayName, roleLabel }: ProfileCardProps) {
  return (
    <div className="flex flex-col items-center space-y-8">
      <Avatar userId={profile.id} role={profile.role} />
      <AvatarUpload userId={profile.id} />

      <h1 className="text-4xl font-extrabold text-center dark:text-white">{displayName}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">{roleLabel}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-10">
        <Info label="User ID" value={profile.id} icon={<Users />} />
        <Info label="Email" value={profile.email} icon={<Mail />} />
        <Info label="Role" value={roleLabel} icon={<ShieldCheck />} />
        <Info label="Email Confirmed" value={profile.email_confirmed_at ? "Yes" : "No"} icon={<KeyRound />} />
        <Info label="Created At" value={new Date(profile.created_at).toLocaleString()} icon={<CalendarClock />} />
        <Info label="Last Signed  In" value={new Date(profile.last_sign_in_at).toLocaleString()} icon={<LogIn />} />
        <Info
          label="Auth Providers"
          value={profile.app_metadata?.providers?.join(", ") || "Unknown"}
          icon={<Globe />}
        />
      </div>

      <div className="w-full mt-6">
        <DeleteAccount />
      </div>
    </div>
  )
}

function Info({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-5 flex gap-4 items-start">
      <div className="text-blue-600 dark:text-blue-400 mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-base font-medium text-gray-900 dark:text-white break-words">{value}</p>
      </div>
    </div>
  )
}