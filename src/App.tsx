import "./App.css";
import { preferences } from "./preferences.ts";
import { options } from "./options.ts";

type Rank = number & { __brand: "Rank" };

const asRank = (i: number) => i as Rank;

type Pick = {
  identifier: string;
  person: string;
  rank: Rank | "not picked";
};

const optionsWithPicks = options.map((option) => {
  const picks: Pick[] = Object.entries(preferences).map(([person, picks]) => {
    const index = picks.findIndex(
      (identifier) => identifier === option.identifier,
    );
    const rank = index === -1 ? "not picked" : asRank(index);
    return {
      person,
      rank,
      identifier: option.identifier,
    };
  });

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
            <td className="text-left pl-4">Title</td>
          </tr>
        </thead>
        <tbody>
          {optionsWithPicks.map((option) => (
            <tr key={option.identifier}>
              {participants.map((participant) => {
                const maybePick = option.picks.find(
                  (pick) => pick.person === participant,
                );

                return (
                  <td>
                    {maybePick !== undefined && maybePick.rank !== "not picked"
                      ? maybePick.rank
                      : ""}
                  </td>
                );
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
