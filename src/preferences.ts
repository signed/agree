import { z } from "zod";
import preferencesJson from "./../inputs/preferences.json";

const preferenceSchema = z.array(z.string());
type Preference = z.infer<typeof preferenceSchema>;
const preferencesSchema = z.record(z.string().min(1), preferenceSchema);
export const preferences: Record<string, Preference> =
  preferencesSchema.parse(preferencesJson);
