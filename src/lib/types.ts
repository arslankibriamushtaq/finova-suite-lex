// Product management system types based on specification

export interface Product {
  id: string
  name: string
  name_ar?: string
  description?: string
  description_ar?: string
  logo_url?: string
  notification_email?: string
  country?: string
  master_category?: string
  sub_categories?: string[]
  customer_types?: string[]
  commodity_id: string
  commodity?: Commodity
  status: "active" | "inactive" | "draft"
  created_at: string
  updated_at: string
  created_by: string
  partner_id?: string
  partner?: Partner
  documents?: Document[]
  api_configs?: ApiConfig[]
  fee_slabs?: FeeSlab[]
}

export interface Commodity {
  id: string
  name: string
  code: string
  description?: string
  category: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface FeeSlab {
  id: string
  product_id: string
  min_amount: number
  max_amount?: number
  fee_type: "fixed" | "percentage" | "tiered"
  fee_value: number
  currency: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface ApiConfig {
  id: string
  product_id: string
  endpoint_url: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  headers?: Record<string, string>
  auth_type: "none" | "bearer" | "basic" | "api_key"
  auth_config?: Record<string, any>
  timeout: number
  retry_count: number
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface Partner {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: "active" | "inactive" | "pending"
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  product_id: string
  name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_by: string
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface ProductFilters {
  search?: string
  status?: string
  commodity_id?: string
  partner_id?: string
  country?: string
  master_category?: string
  customer_type?: string
  has_commodity?: boolean
  date_from?: string
  date_to?: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductsResponse {
  products: Product[]
  pagination: PaginationInfo
}
