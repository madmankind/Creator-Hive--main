import { z } from 'zod'

export const zTalentInput = z.object({
  name: z.string().min(2),
  instagram: z.string().optional(),
  role: z.string().optional(),
  rate: z.number().int().nonnegative().optional(),
  avatarUrl: z.string().url().optional(),
  location: z.string().optional(),
})
export type TalentInput = z.infer<typeof zTalentInput>

export const zCampaignInput = z.object({
  title: z.string().min(2),
  brief: z.string().min(2),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  talentIds: z.array(z.string()).min(1),
})
export type CampaignInput = z.infer<typeof zCampaignInput>







