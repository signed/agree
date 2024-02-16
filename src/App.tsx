import "./App.css";
import { preferences } from "./preferences.ts";
import { options } from "./options.ts";

type Rank = number & { __brand: "Rank" };

const rank = (i: number) => i as Rank;

type Pick = {
  identifier: string;
  person: string;
  rank: Rank;
};

const allPicks: Pick[] = Object.entries(preferences).flatMap(([person, picks]) => {
  return picks.map((identifier, index) => {
    return {
      person,
      identifier,
      rank: rank(index),
    };
  });
});

const optionsWithPicks = options.map((option) => {
  const picks = allPicks.filter(
    (pick) => pick.identifier === option.identifier,
  );
  return {
    ...option,
    picks,
  };
});

const participants = Object.keys(preferences);

export function App() {
  return (
    <>
      <ul></ul>
      <table>
        <thead>
          <tr>
            {participants.map((participant) => (
              <td>{participant}</td>
            ))}
            <td>Identifier</td>
            <td className='text-left pl-4'>Title</td>
          </tr>
        </thead>
        <tbody>
          {optionsWithPicks.map((option) => (
            <tr key={option.identifier}>
              {participants.map((participant) => {
                const maybePick = option.picks.find(pick => pick.person === participant);
                return <td>{maybePick? maybePick.rank: ''}</td>;
              })}
              <td className="items-start">{option.identifier}</td>
              <td className="text-left pl-4">{option.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
