export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          title: string
          description: string | null
          file_url: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          file_url: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          file_url?: string
          created_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          start_time: string
          end_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_time: string
          end_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string | null
          created_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          created_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          created_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          created_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          id: number
          name: string
          email: string
          message: string
          created_at: string
          is_read: boolean
        }
        Insert: {
          id?: number
          name: string
          email: string
          message: string
          created_at?: string
          is_read?: boolean
        }
        Update: {
          id?: number
          name?: string
          email?: string
          message?: string
          created_at?: string
          is_read?: boolean
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          category: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          category?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          category?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          id: string
          name: string
          position: string
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          position: string
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          position?: string
          photo_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          title: string
          category: string | null
          likes_count: number
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          title: string
          category?: string | null
          likes_count?: number
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          title?: string
          category?: string | null
          likes_count?: number
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          date: string
          description: string
          id: string
          image_url: string | null
          title: string
        }
        Insert: {
          created_at?: string
          date: string
          description: string
          id?: string
          image_url?: string | null
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: string
          image_url?: string | null
          title?: string
        }
        Relationships: []
      }
      polls: {
        Row: {
          id: string
          question: string
          is_active: boolean
          created_at: string
          end_date: string | null
        }
        Insert: {
          id?: string
          question: string
          is_active?: boolean
          created_at?: string
          end_date?: string | null
        }
        Update: {
          id?: string
          question?: string
          is_active?: boolean
          created_at?: string
          end_date?: string | null
        }
        Relationships: []
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string
          option_text: string
          votes: number
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_text: string
          votes?: number
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_text?: string
          votes?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            referencedRelation: "polls"
            referencedColumns: ["id"]
          }
        ]
      }
      site_settings: {
        Row: {
          id: string
          value: string
          label: string
          group: string
        }
        Insert: {
          id: string
          value: string
          label: string
          group: string
        }
        Update: {
          id?: string
          value?: string
          label?: string
          group?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          quote: string
          author: string
          role: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          quote: string
          author: string
          role?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          quote?: string
          author?: string
          role?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_post_like: {
        Args: {
          post_id: string
        }
        Returns: undefined
      }
      increment_vote: {
        Args: {
          option_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Post = Database['public']['Tables']['posts']['Row'];
export type Program = Database['public']['Tables']['programs']['Row'];
export type GalleryImage = Database['public']['Tables']['gallery_images']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type Member = Database['public']['Tables']['members']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];
export type Faq = Database['public']['Tables']['faqs']['Row'];
export type Poll = Database['public']['Tables']['polls']['Row'] & { poll_options: PollOption[] };
export type PollOption = Database['public']['Tables']['poll_options']['Row'];
export type SiteSetting = Database['public']['Tables']['site_settings']['Row'];
export type Testimonial = Database['public']['Tables']['testimonials']['Row'];