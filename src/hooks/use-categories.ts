"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { createClient } from "@/server/supabase/client"
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/server/actions/categories"
import type { CategoryValues } from "@/lib/schemas/category"
import type { Category } from "@/types/domain"

export const categoriesQueryKey = ["categories"] as const

export function useCategories(initialData?: Category[]) {
  return useQuery<Category[]>({
    queryKey: categoriesQueryKey,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("kind")
        .order("name")
      if (error) throw error
      return data ?? []
    },
    initialData,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: CategoryValues) => createCategoryAction(values),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: categoriesQueryKey })
    },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CategoryValues }) =>
      updateCategoryAction(id, values),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: categoriesQueryKey })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategoryAction(id),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: categoriesQueryKey })
    },
  })
}
