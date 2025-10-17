// types/project-credits.ts
interface User {
  id: number
  username: string
  display_name: string
  profile_photo: string
  talent: string
}

interface Role {
  id: number
  name: string
  category: {
    id: number
    name: string
  }
}

interface ProjectCredit {
  user_id: number
  project_credit_role_id?: number
  custom_role?: string
}
