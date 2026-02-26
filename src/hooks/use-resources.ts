'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Resource, ResourceMetadata, ResourceStatus, ResourceType } from '@/types/database'

function getSupabase() {
  return createClient()
}

export function useResources(filters?: { types?: ResourceType[]; statuses?: ResourceStatus[] }) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['resources', filters],
    queryFn: async () => {
      let q = getSupabase().from('resources').select('*').order('created_at', { ascending: false })

      if (filters?.types?.length) {
        q = q.in('type', filters.types)
      }

      if (filters?.statuses?.length) {
        q = q.in('status', filters.statuses)
      }

      const { data, error } = await q
      if (error) throw error
      return data as Resource[]
    },
  })

  // Realtime subscription
  useEffect(() => {
    const channel = getSupabase()
      .channel('resources_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, () => {
        queryClient.invalidateQueries({ queryKey: ['resources'] })
      })
      .subscribe()

    return () => {
      getSupabase().removeChannel(channel)
    }
  }, [queryClient])

  return query
}

export function useResource(id: string | null) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await getSupabase()
        .from('resources')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Resource
    },
    enabled: !!id,
  })
}

export function useCreateResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (resource: {
      type: ResourceType
      name: string
      latitude?: number
      longitude?: number
      capacity?: number
      contact_phone?: string
      metadata?: ResourceMetadata
    }) => {
      const {
        data: { user },
      } = await getSupabase().auth.getUser()

      const { data, error } = await getSupabase()
        .from('resources')
        // @ts-expect-error - Supabase type generation issue
        .insert({
          ...resource,
          status: 'available',
          owner_id: user?.id,
          metadata: resource.metadata || {},
        })
        .select()
        .single()

      if (error) throw error
      return data as Resource
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}

export function useUpdateResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Resource> & { id: string }) => {
      const { data, error } = await getSupabase()
        .from('resources')
        // @ts-expect-error - Supabase type generation issue
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Resource
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['resource', data.id] })
    },
  })
}

export function useAssignResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      resourceId,
      fireReportId,
    }: {
      resourceId: string
      fireReportId: string | null
    }) => {
      const { data, error } = await getSupabase()
        .from('resources')
        // @ts-expect-error - Supabase type generation issue
        .update({
          assigned_to: fireReportId,
          status: fireReportId ? 'deployed' : 'available',
        })
        .eq('id', resourceId)
        .select()
        .single()

      if (error) throw error
      return data as Resource
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}
