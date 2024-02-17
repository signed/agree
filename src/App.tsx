import "./App.css";
import { preferences } from "./preferences.ts";
import { Option, options } from "./options.ts";
import { asRank, Rank, rankComparator } from "./rank.ts";
import { useState } from "react";
import { Comparator } from "./rank.test.ts";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeading,
  PopoverTrigger,
} from "./popover.tsx";

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

type TableData = OptionWithPicks & { score: Score };

const tableData: TableData[] = options.map((option) => {
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

const scoreSorter = (a: TableData, b: TableData) => {
  return a.score - b.score;
};

const sortByParticipantRank = (participant: string) => {
  return (a: TableData, b: TableData) => {
    const aPick = a.picks.find((pick) => pick.person === participant);
    const bPick = b.picks.find((pick) => pick.person === participant);
    return rankComparator(
      aPick?.rank ?? "not picked",
      bPick?.rank ?? "not picked",
    );
  };
};

export function App() {
  const [sorter, setSorter] = useState<Comparator<TableData>>(
    () => scoreSorter,
  );

  const sortedTableData = tableData.sort(sorter);

  return (
    <>
      <table>
        <thead>
          <tr>
            {participants.map((participant) => (
              <td
                onClick={() =>
                  setSorter(() => sortByParticipantRank(participant))
                }
              >
                {participant}
              </td>
            ))}
            <td
              className="pl-4"
              onClick={() => {
                setSorter(() => scoreSorter);
              }}
            >
              Score
            </td>
            <td className="text-left pl-4">Title</td>
            <td>Identifier</td>
          </tr>
        </thead>
        <tbody>
          {sortedTableData.map((option) => (
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
              <td className="text-left pl-4">
                <Popover>
                  <PopoverTrigger>{option.name}</PopoverTrigger>
                  <PopoverContent className="Popover">
                    <PopoverHeading>{option.name}</PopoverHeading>
                    <PopoverDescription>
                      <p className="border-b-2">
                        keywords:{" "}
                        {option.keywords.map((keyword) => keyword).join(", ")}
                      </p>
                      <p className="pt-2">
                        {option.description}
                      </p>
                    </PopoverDescription>
                  </PopoverContent>
                </Popover>
              </td>
              <td className="items-start">{option.identifier}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
