import { preferences } from "./preferences.ts";
import { options } from "./options.ts";
import "./App.css";

const participants = Object.keys(preferences);

export function App() {
  return (
    <>
      <ul>
        {participants.map((participant) => (
          <li key={participant} className="text-left">
            {participant}
          </li>
        ))}
      </ul>
      <table>
        <tbody>
          {options.map((option) => (
            <tr key={option.identifier}>
              <td className="items-start">{option.identifier}</td>
              <td className="text-left pl-4">{option.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
