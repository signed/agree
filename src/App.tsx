import "./App.css";
import optionsJson from "./../inputs/options.json";

import {z} from 'zod'

const optionSchema = z.object({identifier: z.string(), name: z.string()});
type Option = z.infer<typeof optionSchema>
const optionsSchema = z.array(optionSchema);

const options: Option[] = optionsSchema.parse(optionsJson);


export function App() {
  return (
    <>
      <table>
          {options.map(option => <tr key={option.identifier}>
              <td>{option.identifier}</td>
              <td>{option.name}</td>
          </tr>)}
      </table>
    </>
  );
}
