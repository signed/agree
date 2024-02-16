import "./App.css";
import { preferences } from "./preferences.ts";
import { Option, options } from "./options.ts";

type Rank = number & { __brand: "Rank" };

const asRank = (i: number) => i as Rank;

type Pick = {
  identifier: string;
  person: string;
  rank: Rank | "not picked";
};

type OptionWithPicks = Option & { picks: Pick[] };

type Score = number & { __brand: "Score" };

const calculateScore = (option: OptionWithPicks): Score => {
  return option.picks.reduce((acc, pick) => {
    const score = pick.rank === "not picked" ? 17 : pick.rank;
    return (score + acc) as Score;
  }, 0 as Score);
};

const scoredOptions = options.map((option) => {
  const picks: Pick[] = Object.entries(preferences).map(([person, picks]) => {
    const index = picks.findIndex(
      (identifier) => identifier === option.identifier,
    );
    const rank = index === -1 ? "not picked" : asRank(index + 1);
    return {
      person,
      rank,
      identifier: option.identifier,
    };
  });
  const optionWithPicks = {
    ...option,
    picks,
  };

  const score = calculateScore(optionWithPicks);

  return {
    ...option,
    picks,
    score,
  };
});

const participants = Object.keys(preferences);

const sortedByScore = scoredOptions.sort((a, b) => {
  return a.score - b.score;
});

export function App() {
  return (
    <>
      <table>
        <thead>
          <tr>
            {participants.map((participant) => (
              <td>{participant}</td>
            ))}
            <td className="pl-4">Score</td>
            <td className="text-left pl-4">Title</td>
            <td>Identifier</td>
          </tr>
        </thead>
        <tbody>
          {sortedByScore.map((option) => (
              <tr key={option.identifier} className="border-b-2">
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
                <td className="pl-4">{option.score}</td>
                <td className="text-left pl-4">{option.name}</td>
                <td className="items-start">{option.identifier}</td>
              </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
