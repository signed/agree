import { z } from 'zod'
import conclusionsJson from '../inputs/conclusions.json'

const itemsSchema = z.array(z.string())

const conclusionSchema = z.object({
  name: z.string(),
  items: itemsSchema,
})

export type Conclusion = z.infer<typeof conclusionSchema>
const conclusionsSchema = z.array(conclusionSchema)

export const conclusions = conclusionsSchema.parse(conclusionsJson)

export const standInConclusion = () => ({ name: 'stand in', items: [] })
