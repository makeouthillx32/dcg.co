"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTheme } from "@/app/provider";
import { Users, UserPlus, UserX, User, Calendar, Check, X } from "lucide-react";

interface Member {
  id: number;
  name: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
}

const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

export default function RWmembers() {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";
  
  const [mode, setMode] = useState<"add" | "edit" | "delete">("add");
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [availability, setAvailability] = useState<Record<string, boolean>>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/schedule/members");
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      toast.error("Could not load team members");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) return toast.error("Member name is required");
    if (!Object.values(availability).some(v => v)) return toast.error("Select at least one day of availability");
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/schedule/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          ...availability 
        }),
      });

      if (!res.ok) throw new Error("Failed to add member");
      
      toast.success("Team member added successfully");
      fetchMembers();
      resetForm();
    } catch (error) {
      toast.error("Failed to add team member");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedId) return toast.error("Select a member to edit");
    if (!name.trim()) return toast.error("Member name is required");
    if (!Object.values(availability).some(v => v)) return toast.error("Select at least one day of availability");
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/schedule/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: selectedId,
          name, 
          ...availability 
        }),
      });

      if (!res.ok) throw new Error("Failed to update member");
      
      toast.success("Team member updated successfully");
      fetchMembers();
      resetForm();
    } catch (error) {
      toast.error("Failed to update team member");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return toast.error("Select a member to delete");
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/schedule/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId }),
      });

      if (!res.ok) throw new Error("Failed to delete member");
      
      toast.success("Team member deleted successfully");
      fetchMembers();
      resetForm();
    } catch (error) {
      toast.error("Failed to delete team member");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setAvailability({
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false
    });
    setSelectedId(null);
  };

  const handleMemberSelect = (id: number) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    setSelectedId(id);
    setName(member.name);
    setAvailability({
      monday: member.monday,
      tuesday: member.tuesday,
      wednesday: member.wednesday,
      thursday: member.thursday,
      friday: member.friday
    });
  };

  const toggleAvailability = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  return (
    <div className={`p-6 rounded-[var(--radius)] shadow-[var(--shadow-md)] ${
      isDark 
        ? "bg-[hsl(var(--card))]" 
        : "bg-[hsl(var(--background))]"
    } mt-8`}>
      <h2 className="text-xl font-[var(--font-serif)] font-bold mb-6 flex items-center text-[hsl(var(--foreground))]">
        <Users className="mr-2 text-[hsl(var(--sidebar-primary))]" size={20} />
        Team Member Management
      </h2>
      
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded-[var(--radius)] font-[var(--font-sans)] transition-colors duration-200 flex items-center ${
            mode === "add" 
              ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]" 
              : `${isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"} text-[hsl(var(--muted-foreground))]`
          }`}
          onClick={() => {
            setMode("add");
            resetForm();
          }}
          disabled={isLoading}
        >
          <UserPlus size={16} className="mr-1" />
          Add Member
        </button>
        <button
          className={`px-4 py-2 rounded-[var(--radius)] font-[var(--font-sans)] transition-colors duration-200 flex items-center ${
            mode === "edit" 
              ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]" 
              : `${isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"} text-[hsl(var(--muted-foreground))]`
          }`}
          onClick={() => {
            setMode("edit");
            resetForm();
          }}
          disabled={isLoading}
        >
          <User size={16} className="mr-1" />
          Edit Member
        </button>
        <button
          className={`px-4 py-2 rounded-[var(--radius)] font-[var(--font-sans)] transition-colors duration-200 flex items-center ${
            mode === "delete" 
              ? "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]" 
              : `${isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"} text-[hsl(var(--muted-foreground))]`
          }`}
          onClick={() => {
            setMode("delete");
            resetForm();
          }}
          disabled={isLoading}
        >
          <UserX size={16} className="mr-1" />
          Delete Member
        </button>
      </div>

      {(mode === "edit" || mode === "delete") && (
        <div className="mb-6">
          <label className="block text-sm font-medium font-[var(--font-sans)] text-[hsl(var(--foreground))] mb-2">
            Select Team Member
          </label>
          <select
            className={`w-full px-4 py-2 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] font-[var(--font-sans)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))] focus:border-[hsl(var(--sidebar-primary))] transition-colors leading-[1.5] ${
              !members.length ? "opacity-70 cursor-not-allowed" : ""
            }`}
            value={selectedId ?? ""}
            onChange={(e) => handleMemberSelect(parseInt(e.target.value))}
            disabled={isLoading || !members.length}
          >
            <option value="">Select a team member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {mode !== "delete" && (
        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="member-name" className="block text-sm font-medium font-[var(--font-sans)] text-[hsl(var(--foreground))]">
              Member Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                <User size={16} />
              </span>
              <input
                id="member-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter member name"
                className="w-full px-4 py-2 pl-10 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] font-[var(--font-sans)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))] focus:border-[hsl(var(--sidebar-primary))] transition-colors leading-[1.5]"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium font-[var(--font-sans)] text-[hsl(var(--foreground))]">
              <Calendar size={16} className="inline mr-1" />
              Availability
            </label>
            <div className={`grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-[var(--radius)] ${
              isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
            }`}>
              {days.map((day) => (
                <div 
                  key={day}
                  onClick={() => toggleAvailability(day)}
                  className={`p-2 rounded-[var(--radius)] cursor-pointer transition-colors flex items-center justify-between ${
                    availability[day] 
                      ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]" 
                      : `bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`
                  }`}
                >
                  <span className="capitalize font-[var(--font-sans)]">{day.slice(0, 3)}</span>
                  {availability[day] ? <Check size={16} /> : <X size={16} className="opacity-50" />}
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={mode === "add" ? handleAdd : handleEdit}
            disabled={isLoading || !name.trim() || !Object.values(availability).some(v => v)}
            className={`px-6 py-2 bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded-[var(--radius)] hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors duration-200 shadow-[var(--shadow-sm)] font-[var(--font-sans)] font-medium ${
              isLoading || !name.trim() || !Object.values(availability).some(v => v) ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isLoading 
              ? (mode === "add" ? "Adding..." : "Updating...") 
              : (mode === "add" ? "Add Member" : "Update Member")
            }
          </button>
        </div>
      )}
      
      {mode === "delete" && selectedId && (
        <div className="space-y-4">
          <div className={`p-4 rounded-[var(--radius)] ${
            isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
          }`}>
            <p className="text-sm font-[var(--font-sans)] text-[hsl(var(--foreground))] mb-2">
              <span className="font-medium">Are you sure you want to delete:</span>
            </p>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[hsl(var(--sidebar-primary-foreground))] bg-[hsl(var(--sidebar-primary))] font-[var(--font-sans)] font-medium mr-2`}>
                {members.find(m => m.id === selectedId)?.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-[hsl(var(--foreground))] font-[var(--font-sans)]">
                {members.find(m => m.id === selectedId)?.name}
              </p>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-1">
              {days.map(day => {
                const isAvailable = members.find(m => m.id === selectedId)?.[day as keyof Member];
                return (
                  <span 
                    key={day}
                    className={`text-xs px-2 py-1 rounded-full font-[var(--font-sans)] ${
                      isAvailable 
                        ? "bg-[hsl(var(--sidebar-primary))]/20 text-[hsl(var(--sidebar-primary))]" 
                        : "bg-[hsl(var(--muted-foreground))]/10 text-[hsl(var(--muted-foreground))]"
                    }`}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </span>
                );
              })}
            </div>
          </div>
          
          <p className="text-sm text-[hsl(var(--destructive))] font-[var(--font-sans)]">
            This action cannot be undone. This will permanently delete the team member.
          </p>
          
          <button
            onClick={handleDelete}
            disabled={isLoading || !selectedId}
            className={`px-6 py-2 bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] rounded-[var(--radius)] hover:bg-[hsl(var(--destructive))]/90 transition-colors duration-200 shadow-[var(--shadow-sm)] font-[var(--font-sans)] font-medium flex items-center justify-center ${
              isLoading || !selectedId ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <UserX size={16} className="mr-1" />
            {isLoading ? "Deleting..." : "Delete Member"}
          </button>
        </div>
      )}
      
      {members.length > 0 && mode !== "delete" && (
        <div className="mt-8">
          <h3 className="text-lg font-[var(--font-serif)] font-medium mb-3 text-[hsl(var(--foreground))]">Current Team Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div 
                key={member.id} 
                className={`p-4 rounded-[var(--radius)] ${
                  isDark 
                    ? "bg-[hsl(var(--secondary))]" 
                    : "bg-[hsl(var(--muted))]"
                }`}
              >
                <div className="flex items-center mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[hsl(var(--sidebar-primary-foreground))] ${
                    `bg-[hsl(var(--chart-${(member.id % 5) + 1}))]`
                  }`}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-[hsl(var(--foreground))] font-[var(--font-sans)]">{member.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {days.map(day => 
                        member[day as keyof Member] && (
                          <span 
                            key={day}
                            className="text-xs px-1.5 py-0.5 rounded-full bg-[hsl(var(--sidebar-primary))]/20 text-[hsl(var(--sidebar-primary))] font-[var(--font-sans)]"
                          >
                            {day.slice(0, 3)}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {members.length === 0 && !isLoading && (
        <div className={`mt-4 p-4 rounded-[var(--radius)] text-center ${
          isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
        }`}>
          <p className="text-[hsl(var(--muted-foreground))] font-[var(--font-sans)]">
            No team members found. Add your first team member.
          </p>
        </div>
      )}
    </div>
  );
}