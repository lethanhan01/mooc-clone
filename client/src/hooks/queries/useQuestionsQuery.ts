import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { questionService } from '@/services/question.service'
import type { CreateQuestionRequest } from '@/types'

export function useQuestionsListQuery() {
  return useQuery({
    queryKey: queryKeys.questions.list(),
    queryFn: () => questionService.getQuestions(),
  })
}

export function useQuestionsByTopicQuery(topic: string) {
  return useQuery({
    queryKey: queryKeys.questions.byTopic(topic),
    queryFn: () => questionService.getQuestionsByTopic(topic),
    enabled: Boolean(topic),
  })
}

export function useCreateQuestionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateQuestionRequest) => questionService.createQuestion(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.questions.all })
    },
  })
}

export function useDeleteQuestionMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => questionService.deleteQuestion(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.questions.all })
    },
  })
}
