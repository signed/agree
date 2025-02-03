import { z } from 'zod'
import preferencesJson from './../inputs/preferences.json'

const preferenceSchema = z.array(z.array(z.string()))
type Preference = z.infer<typeof preferenceSchema>
const preferencesSchema = z.record(z.string().min(1), preferenceSchema)
export const preferences: Record<string, Preference> = preferencesSchema.parse(preferencesJson)

export const allPreferences = Object.entries(preferences).flatMap(([_person, allPicks]) => {
    return allPicks.flatMap(it => it)
});
