import { z } from 'zod'
import conclusionsJson from '../inputs/conclusions.json'

const picksSchema = z.array(z.string())

const namedConclusionSchema = z.object({
  name: z.string(),
  picks: picksSchema,
})

const conclusionsSchema = z.array(namedConclusionSchema)
export const conclusions = conclusionsSchema.parse(conclusionsJson)

export const picks = conclusions.at(0)!.picks
