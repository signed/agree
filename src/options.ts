import { z } from 'zod'
import optionsJson from '../inputs/options.json'

const optionSchema = z.object({
  identifier: z.string(),
  userGroup: z.array(z.string()),
  keywords: z.array(z.string()),
  name: z.string(),
  presenter: z.array(z.string()),
  organisation: z.array(z.string()),
  description: z.string(),
})
export type Option = z.infer<typeof optionSchema>
const optionsSchema = z.array(optionSchema)

export const options: Option[] = optionsSchema.parse(optionsJson)
