# Button Component Challenge

## You are given

A blank Button component template. You must implement it to fetch and display random jokes.

## Requirements

1. Make the button text customizable (learn about props)
2. On click, fetch a random joke from `https://official-joke-api.appspot.com/random_joke`
3. Display the joke setup and punchline below the button
4. Show "Loading..." while fetching
5. Handle error states
6. Make the button look different when disabled (more props)

## API Response

```json
{
    "setup": "Why don't scientists trust atoms?",
    "punchline": "Because they make up everything!"
}
```

## What you'll learn

- Props: How to pass data to components
- State: Use useState to manage component data
- Events: Handle button clicks with onClick
- API Calls: Use fetch() to get data from the internet
- Conditional Rendering: Show different content based on state

## Validation Points

- ✅ Click triggers fetch to correct URL
- ✅ Displays both setup and punchline text
- ✅ Button state changes on hover/click/disabled
- ✅ Loading state shows "Loading..." text
- ✅ Error handling displays user-friendly messages
