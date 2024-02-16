import { z } from "zod";
import optionsJson from "../inputs/options.json";

const optionSchema = z.object({
  identifier: z.string(),
  name: z.string(),
});
type Option = z.infer<typeof optionSchema>;
const optionsSchema = z.array(optionSchema);

export const options: Option[] = optionsSchema.parse(optionsJson);
