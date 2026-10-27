import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { attemptService } from '@/services/attempt.service'
import type { StartAttemptRequest, SubmitAnswerRequest } from '@/types'

export function useStartAttemptMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StartAttemptRequest) => attemptService.startAttempt(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attempts.all })
    },
  })
}

export function useSubmitAnswerMutation() {
  return useMutation({
    mutationFn: ({ attemptId, payload }: { attemptId: number; payload: SubmitAnswerRequest }) =>
      attemptService.submitAnswer(attemptId, payload),
  })
}

export function useSubmitExamMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (attemptId: number) => attemptService.submitExam(attemptId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attempts.all })
      queryClient.setQueryData(queryKeys.attempts.detail(String(data.attemptId)), data)
    },
  })
}

export function useAttemptResultQuery(attemptId: number | string | null | undefined) {
  const idNum = attemptId ? Number(attemptId) : null
  return useQuery({
    queryKey: queryKeys.attempts.detail(String(attemptId)),
    queryFn: () => attemptService.getResult(idNum!),
    enabled: Boolean(idNum && !Number.isNaN(idNum)),
  })
}
