import { z } from 'zod'
import conclusionsJson from '../inputs/conclusions.json'

const itemsSchema = z.array(z.string())

const namedConclusionSchema = z.object({
  name: z.string(),
  items: itemsSchema,
})

const conclusionsSchema = z.array(namedConclusionSchema)
export const conclusions = conclusionsSchema.parse(conclusionsJson)

export const conclusion = conclusions.at(0) ?? { name: 'stand in', items: [] }
export const items = conclusion.items ?? []
