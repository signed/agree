import './App.css'
import { allPreferences, preferences } from './preferences.ts'
import { Option, options } from './options.ts'
import { asRank, Comparator, Rank, rankComparator } from './rank.ts'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverDescription, PopoverHeading, PopoverTrigger } from './popover/popover.tsx'
import { Conclusion, conclusions, standInConclusion } from './conclusions.ts'
import { FaCopy } from 'react-icons/fa6'

type Penalty = {
  identifier: string
  person: string
  rank: 'not picked'
  penalty: Score
}

type Position = {
  identifier: string
  person: string
  rank: Rank
}

type Pick = Position | Penalty

type OptionWithPicks = Option & { picks: Pick[] }

type Score = number & { __brand: 'Score' }

const calculateScore = (option: OptionWithPicks): Score => {
  return option.picks.reduce((acc, pick) => {
    const score = pick.rank === 'not picked' ? pick.penalty : pick.rank
    return (score + acc) as Score
  }, 0 as Score)
}

type TableData = OptionWithPicks & {
  score: Score
  interestedPersonCount: number
}

const penaltyForPerson = (person: string): Score => {
  const allPicks = preferences[person]
  return (allPicks.flat().length + 1) as Score
}

//same penalty for all person
const penaltyForPerson2 = (_person: string): Score => {
  return Math.max(...Object.keys(preferences).map(penaltyForPerson)) as Score
}

function picksToConsider(filter: Filter, option: Option): Pick[] {
  return Object.entries(preferences).map(([person, allPicks]) => {
    const picksToConsider: string[] = [...(allPicks[0] ?? [])]
    if (filter.runnerUps) {
      const runnerUps = allPicks[1] ?? []
      picksToConsider.push(...runnerUps)
    }

    const index = picksToConsider.findIndex((identifier) => identifier === option.identifier)

    if (index === -1) {
      const penalty = penaltyForPerson2(person)
      return {
        person,
        identifier: option.identifier,
        rank: 'not picked',
        penalty,
      }
    }

    const rank = asRank(index + 1)
    return {
      person,
      identifier: option.identifier,
      rank,
    }
  })
}

const participants = Object.keys(preferences)

const scoreSorter = (a: TableData, b: TableData) => {
  return a.score - b.score
}

const interestedPersonCountSorter = (a: TableData, b: TableData) => {
  const diff = b.interestedPersonCount - a.interestedPersonCount
  if (diff === 0) {
    return scoreSorter(a, b)
  }
  return diff
}

const sortByParticipantRank = (participant: string) => {
  return (a: TableData, b: TableData) => {
    const aPick = a.picks.find((pick) => pick.person === participant)
    const bPick = b.picks.find((pick) => pick.person === participant)
    return rankComparator(aPick?.rank ?? 'not picked', bPick?.rank ?? 'not picked')
  }
}

type Filter = {
  runnerUps: boolean
}

function calculateTableData(filter: Filter) {
  return options.map((option) => {
    const picks: Pick[] = picksToConsider(filter, option)
    const optionWithPicks = {
      ...option,
      picks,
    }

    const score = calculateScore(optionWithPicks)
    const interestedPersonCount = picks.reduce((acc, cur) => {
      if (cur.rank === 'not picked') {
        return acc
      }
      return ++acc
    }, 0)

    return {
      ...option,
      picks,
      score,
      interestedPersonCount,
    }
  })
}

function present<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

function exportConclusionToClipboard(conclusion: Conclusion) {
  const optionsInConclusion = conclusion.items
    .map((identifier) => options.find((option) => option.identifier === identifier))
    .filter(present)
  const optionsInConclusionAsString = optionsInConclusion
    .map(
      (option, index) =>
        `${index + 1}. [${option.identifier}] ${option.name} (${option.presenter.join(', ')}) (${option.keywords.join(', ')})`,
    )
    .join('\n')

  const keyWords: string[] = optionsInConclusion.flatMap((option) => option.keywords)

  const grouped = keyWords.reduce((acc, cur) => {
    let words = acc.get(cur)
    if (words === undefined) {
      words = []
      acc.set(cur, words)
    }
    words.push(cur)
    return acc
  }, new Map<string, string[]>())

  const keywords = Array.from(grouped)
    .map(([key, value]) => `${key}: ${value.length}`)
    .join('\n')

  const textToExport = `${optionsInConclusionAsString}

${keywords}`

  navigator.clipboard.writeText(textToExport).catch((e) => console.log(e))
}

const isInConclusion = (conclusion: Conclusion, option: TableData) => conclusion.items.includes(option.identifier)

const sortByConclusion = (conclusion: Conclusion) => (a: TableData, b: TableData) => {
  const aInConclusion = isInConclusion(conclusion, a)
  const bInConclusion = isInConclusion(conclusion, b)
  if (aInConclusion === bInConclusion) {
    const items = conclusion.items
    const aIndex = items.indexOf(a.identifier)
    const bIndex = items.indexOf(b.identifier)
    return aIndex - bIndex
  }
  return aInConclusion ? -1 : 1
}

type ConclusionsViewProps = {
  selected: Conclusion
  onConclusionChanged?: (conclusion: Conclusion) => void
}

function ConclusionsView(props: ConclusionsViewProps) {
  const items = props.selected.items

  return (
    <div>
      <h1>
        Conclusions
        <button
          className="pl-2"
          disabled={items.length === 0}
          onClick={() => exportConclusionToClipboard(props.selected)}
        >
          <FaCopy />
        </button>
      </h1>

      <ul className="list-disc list-inside">
        {conclusions.map((conclusion) => {
          const selected = conclusion.name === props.selected.name
          const className = cx(selected && 'font-bold')
          return (
            <li key={conclusion.name} className={className}>
              <button onClick={() => props.onConclusionChanged?.(conclusion)}>{conclusion.name}</button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function App() {
  const [conclusion, setConclusion] = useState(() => conclusions[0] ?? standInConclusion())
  const [filter, setFilter] = useState<Filter>({
    runnerUps: true,
  })
  const [sorter, setSorter] = useState<Comparator<TableData>>(() => scoreSorter)

  const sortedTableData = calculateTableData(filter).sort(sorter)

  return (
    <>
      <ConclusionsView selected={conclusion} onConclusionChanged={setConclusion} />
      <label htmlFor="favourites">Favourites: </label>
      <input id="favourites" type="checkbox" defaultChecked={true} disabled={true} />
      <label htmlFor="runner up">Runner Up: </label>
      <input
        id="runner up"
        type="checkbox"
        onChange={(e) => setFilter((cur) => ({ ...cur, runnerUps: e.target.checked }))}
        defaultChecked={filter.runnerUps}
      />
      <div>
        {participants.map((participant) => (
          <span className="pr-2">{`${participant}: ${penaltyForPerson(participant)}`}</span>
        ))}
        <span className="pr-2 font-bold">{`max used for all: ${penaltyForPerson2('not accessed')}`}</span>
      </div>
      <MissingOptions />

      <table>
        <thead>
          <tr>
            {participants.map((participant) => (
              <td onClick={() => setSorter(() => sortByParticipantRank(participant))}>{participant}</td>
            ))}
            <td
              className="pl-4"
              onClick={() => {
                setSorter(() => interestedPersonCountSorter)
              }}
            >
              #
            </td>
            <td
              className="pl-1"
              onClick={() => {
                setSorter(() => scoreSorter)
              }}
            >
              Score
            </td>

            <td
              className="pl-4"
              onClick={() => {
                setSorter(() => sortByConclusion(conclusion))
              }}
            >
              Conclusion
            </td>
            <td>Id</td>
            <td className="text-left pl-2">Title</td>
          </tr>
        </thead>
        <tbody>
          {sortedTableData.map((option, index) => {
            const inConclusion = isInConclusion(conclusion, option)
            const className = cx(
              'align-top',
              inConclusion && 'bg-green-100 ',
              index === 6 ? 'border-b-2 border-black' : 'border-b-2',
            )
            const userGroups = option.userGroup.length > 0 ? '(' + option.userGroup.join(', ') + ')' : ''
            return (
              <tr key={option.identifier} className={className}>
                {participants.map((participant) => {
                  const maybePick = option.picks.find((pick) => pick.person === participant)

                  return <td>{maybePick !== undefined && maybePick.rank !== 'not picked' ? maybePick.rank : ''}</td>
                })}
                <td className="pl-4">{option.interestedPersonCount}</td>
                <td className="pl-1">{option.score}</td>
                <td className="text-center pl-4">
                  <input type="checkbox" disabled defaultChecked={inConclusion} />
                </td>
                <td>{option.identifier}</td>
                <td className="text-left pl-2">
                  <Popover>
                    <PopoverTrigger>
                      <div className="flex-col">
                        <div className="text-left">
                          {option.name} {userGroups}
                        </div>
                        <div className="text-left font-extralight">{option.keywords.join(', ')}</div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="Popover">
                      <PopoverHeading className="font-bold underline pb-1">{option.name}</PopoverHeading>
                      <PopoverDescription>
                        <p className="font-bold">{option.presenter.join(', ')}</p>
                        <p className="border-b-2 font-mono">{option.keywords.map((keyword) => keyword).join(', ')}</p>
                        <p className="pt-2">{option.description}</p>
                      </PopoverDescription>
                    </PopoverContent>
                  </Popover>
                </td>
                <td>
                  <div className="flex-col">
                    <div className="text-right">{option.presenter.join(', ')}</div>
                    <div className="text-right font-extralight">{option.organisation.join(', ')}</div>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

const MissingOptions = () => {
  const missingOptions = allPreferences.filter((it) => !options.some((option) => option.identifier === it))
  if (missingOptions.length === 0) {
    return null
  }
  return <div className="font-bold text-red-400">missing: {missingOptions.join(', ')}</div>
}

function cx(...args: unknown[]) {
  return args
    .flat()
    .filter((x) => typeof x === 'string')
    .join(' ')
    .trim()
}
