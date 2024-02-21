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
import { conclusion } from "./conclusion.ts";

type Penalty = {
  identifier: string;
  person: string;
  rank: "not picked";
  penalty: Score;
};

type Position = {
  identifier: string;
  person: string;
  rank: Rank;
};

type Pick = Position | Penalty;

type OptionWithPicks = Option & { picks: Pick[] };

type Score = number & { __brand: "Score" };

const calculateScore = (option: OptionWithPicks): Score => {
  return option.picks.reduce((acc, pick) => {
    const score = pick.rank === "not picked" ? pick.penalty : pick.rank;
    return (score + acc) as Score;
  }, 0 as Score);
};

type TableData = OptionWithPicks & {
  score: Score;
  interestedPersonCount: number;
};

function picksToConsider(filter: Filter, option: Option): Pick[] {
  return Object.entries(preferences).map(([person, allPicks]) => {
    const picksToConsider: string[] = [...(allPicks[0] ?? [])];
    if (filter.runnerUps) {
      const runnerUps = allPicks[1] ?? [];
      picksToConsider.push(...runnerUps);
    }

    const index = picksToConsider.findIndex(
      (identifier) => identifier === option.identifier,
    );

    if (index === -1) {
      const totalNumberOfRankedOptionsByPerson = allPicks.flat().length + 1;
      return {
        person,
        identifier: option.identifier,
        rank: "not picked",
        penalty: totalNumberOfRankedOptionsByPerson as Score,
      };
    }

    const rank = asRank(index + 1);
    return {
      person,
      identifier: option.identifier,
      rank,
    };
  });
}

const participants = Object.keys(preferences);

const scoreSorter = (a: TableData, b: TableData) => {
  return a.score - b.score;
};

const interestedPersonCountSorter = (a: TableData, b: TableData) => {
  const diff = b.interestedPersonCount - a.interestedPersonCount;
  if (diff === 0) {
    return scoreSorter(a, b);
  }
  return diff;
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

type Filter = {
  runnerUps: boolean;
};

function calculateTableData(filter: Filter) {
  return options.map((option) => {
    const picks: Pick[] = picksToConsider(filter, option);
    const optionWithPicks = {
      ...option,
      picks,
    };

    const score = calculateScore(optionWithPicks);
    const interestedPersonCount = picks.reduce((acc, cur) => {
      if (cur.rank === "not picked") {
        return acc;
      }
      return ++acc;
    }, 0);

    return {
      ...option,
      picks,
      score,
      interestedPersonCount,
    };
  });
}

function present<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

function exportConclusionToClipboard() {
  const textToExport = conclusion
    .map((identifier) =>
      options.find((option) => option.identifier === identifier),
    )
    .filter(present)
    .map((option) => `${option.identifier}: ${option.name}`)
    .join("\n");
  navigator.clipboard.writeText(textToExport).catch((e) => console.log(e));
}

export function App() {
  const [filter, setFilter] = useState<Filter>({
    runnerUps: true,
  });
  const [sorter, setSorter] = useState<Comparator<TableData>>(
    () => scoreSorter,
  );

  const sortedTableData = calculateTableData(filter).sort(sorter);

  return (
    <>
      <label htmlFor="favourites">Favourites: </label>
      <input
        id="favourites"
        type="checkbox"
        defaultChecked={true}
        disabled={true}
      />
      <label htmlFor="runner up">Runner Up: </label>
      <input
        id="runner up"
        type="checkbox"
        onChange={(e) =>
          setFilter((cur) => ({ ...cur, runnerUps: e.target.checked }))
        }
        defaultChecked={filter.runnerUps}
      />
      <button
        className="pl-5"
        disabled={conclusion.length === 0}
        onClick={() => exportConclusionToClipboard()}
      >
        Copy conclusion to clipboard
      </button>
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
                setSorter(() => interestedPersonCountSorter);
              }}
            >
              #
            </td>
            <td
              className="pl-1"
              onClick={() => {
                setSorter(() => scoreSorter);
              }}
            >
              Score
            </td>

            <td className="pl-4">Conclusion</td>
            <td className="text-left pl-2">Title</td>
            <td>Identifier</td>
          </tr>
        </thead>
        <tbody>
          {sortedTableData.map((option, index) => {
            const inConclusion = conclusion.includes(option.identifier);
            const className = cx(
              inConclusion && "bg-green-100 ",
              index === 7 ? "border-b-2 border-black" : "border-b-2",
            );
            return (
              <tr key={option.identifier} className={className}>
                {participants.map((participant) => {
                  const maybePick = option.picks.find(
                    (pick) => pick.person === participant,
                  );

                  return (
                    <td>
                      {maybePick !== undefined &&
                      maybePick.rank !== "not picked"
                        ? maybePick.rank
                        : ""}
                    </td>
                  );
                })}
                <td className="pl-4">{option.interestedPersonCount}</td>
                <td className="pl-1">{option.score}</td>
                <td className="text-center pl-4">
                  <input
                    type="checkbox"
                    disabled
                    defaultChecked={inConclusion}
                  />
                </td>
                <td className="text-left pl-2">
                  <Popover>
                    <PopoverTrigger>{option.name}</PopoverTrigger>
                    <PopoverContent className="Popover">
                      <PopoverHeading className="font-bold underline pb-1">
                        {option.name}
                      </PopoverHeading>
                      <PopoverDescription>
                        <p className="border-b-2 font-mono">
                          {option.keywords.map((keyword) => keyword).join(", ")}
                        </p>
                        <p className="pt-2">{option.description}</p>
                      </PopoverDescription>
                    </PopoverContent>
                  </Popover>
                </td>
                <td className="items-start">{option.identifier}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function cx(...args: unknown[]) {
  return args
    .flat()
    .filter((x) => typeof x === "string")
    .join(" ")
    .trim();
}
