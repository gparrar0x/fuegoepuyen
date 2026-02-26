export type FireReportStatus =
  | 'pending'
  | 'verified'
  | 'active'
  | 'contained'
  | 'extinguished'
  | 'false_alarm'

export type FireReportSource = 'manual' | 'nasa_firms' | 'twitter' | 'whatsapp' | 'telegram'

export type FireIntensity = 'low' | 'medium' | 'high' | 'extreme'

export type ResourceType = 'water_truck' | 'volunteer' | 'equipment'

export type ResourceStatus = 'available' | 'deployed' | 'offline'

// Type-specific metadata interfaces
export interface VolunteerMetadata {
  nombre_completo?: string
  dni?: string
  edad?: number
  telefono?: string
  email?: string
}

export interface WaterTruckMetadata {
  patente?: string
  modelo?: string
  color?: string
  propietario?: string
}

export interface EquipmentMetadata {
  nombre?: string
  descripcion?: string
}

export type ResourceMetadata = VolunteerMetadata | WaterTruckMetadata | EquipmentMetadata

export type UserRole = 'public' | 'verifier' | 'admin'

export interface FireReport {
  id: string
  latitude: number
  longitude: number
  status: FireReportStatus
  source: FireReportSource
  source_id: string | null
  description: string | null
  reported_by: string | null
  verified_at: string | null
  verified_by: string | null
  confidence_score: number
  intensity: FireIntensity | null
  image_url: string | null
  detected_at: string | null
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  type: ResourceType
  name: string
  latitude: number | null
  longitude: number | null
  status: ResourceStatus
  capacity: number | null
  contact_phone: string | null
  assigned_to: string | null
  owner_id: string | null
  metadata: ResourceMetadata
  created_at: string
  updated_at: string
}

export interface Verification {
  id: string
  fire_report_id: string
  user_id: string
  vote: number
  comment: string | null
  created_at: string
}

export interface Profile {
  id: string
  role: UserRole
  display_name: string | null
  phone: string | null
  zone: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      fire_reports: {
        Row: FireReport
        Insert: Omit<FireReport, 'id' | 'created_at' | 'updated_at' | 'confidence_score'> & {
          id?: string
          created_at?: string
          updated_at?: string
          confidence_score?: number
        }
        Update: Partial<FireReport>
      }
      resources: {
        Row: Resource
        Insert: Omit<Resource, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Resource>
      }
      verifications: {
        Row: Verification
        Insert: Omit<Verification, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Verification>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'> & {
          created_at?: string
        }
        Update: Partial<Profile>
      }
    }
  }
}
