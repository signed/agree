import { z } from 'zod'
import conclusionJson from '../inputs/conclusion.json'

const conclusionSchema = z.array(z.string())
export const conclusion = conclusionSchema.parse(conclusionJson)
