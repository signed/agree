# How to get started

- create your options in `inputs/options.json`
  ```json
  [
    {
      "identifier": "1",
      "name": "The One",
      "description": "The best number there is.",
      "keywords": ["number", "only one"]
    },
    {
      "identifier": "2",
      "name": "Two",
      "description": "Two times the best number. What not to like.",
      "keywords": ["number"]
    }
  ]
  ```
- create your preferences in `inputs/preferences.json`
  ```json
  {
    "Alice": [["1"], ["2"]],
    "Bob": [["2"], ["1"]]
  }
  ```
- pnpm install
- pnpm dev
