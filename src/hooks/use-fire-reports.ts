'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { FireReport, FireReportStatus } from '@/types/database';

function getSupabase() {
  return createClient();
}

function useSupabase() {
  return useMemo(() => getSupabase(), []);
}

export function useFireReports(filters?: {
  statuses?: FireReportStatus[];
  limit?: number;
}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['fire-reports', filters],
    queryFn: async () => {
      let q = getSupabase()
        .from('fire_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.statuses?.length) {
        q = q.in('status', filters.statuses);
      }

      if (filters?.limit) {
        q = q.limit(filters.limit);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as FireReport[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel('fire_reports_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fire_reports' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['fire-reports'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useFireReport(id: string | null) {
  return useQuery({
    queryKey: ['fire-report', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await getSupabase()
        .from('fire_reports')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as FireReport;
    },
    enabled: !!id,
  });
}

export function useCreateFireReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: {
      latitude: number;
      longitude: number;
      description?: string;
      image_url?: string;
    }) => {
      const { data, error } = await getSupabase()
        .from('fire_reports')
        // @ts-expect-error - Supabase type generation issue
        .insert({
          ...report,
          source: 'manual',
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data as FireReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fire-reports'] });
    },
  });
}

export function useUpdateFireReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<FireReport> & { id: string }) => {
      const { data, error } = await getSupabase()
        .from('fire_reports')
        // @ts-expect-error - Supabase type generation issue
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as FireReport;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fire-reports'] });
      queryClient.invalidateQueries({ queryKey: ['fire-report', data.id] });
    },
  });
}

export function useVerifyFireReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fireReportId,
      vote,
      comment,
    }: {
      fireReportId: string;
      vote: 1 | -1;
      comment?: string;
    }) => {
      const { data: { user } } = await getSupabase().auth.getUser();
      if (!user) throw new Error('Must be logged in to verify');

      const { error } = await getSupabase()
        .from('verifications')
        // @ts-expect-error - Supabase type generation issue
        .upsert({
          fire_report_id: fireReportId,
          user_id: user.id,
          vote,
          comment,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fire-reports'] });
    },
  });
}
