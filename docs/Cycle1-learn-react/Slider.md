# Slider Component Challenge

## You are given

A blank Slider component template. You must implement it to fetch trivia facts for numbers with debounced API calls.

## Requirements

1. Show the current slider value (learn about state)
2. When slider moves, fetch trivia from `http://numbersapi.com/{number}/trivia`
3. Display trivia text below the slider
4. Don't fetch on every tiny movement - wait 500ms after user stops (learn about debouncing)
5. Handle loading and error states
6. Make the slider look nice with custom styling

## API Response

```
"7 is the number of days in a week."
```

Note: The API returns plain text, not JSON.

## What you'll learn

- State: Track slider value and trivia text
- Events: Handle onChange events
- useEffect: Watch for value changes
- Debouncing: Use setTimeout to delay API calls
- Performance: Prevent too many API calls

## Validation Points

- ✅ Slider updates value state
- ✅ Calls correct API endpoint
- ✅ Trivia text updates per value
- ✅ Debounced fetch (500ms delay)
- ✅ Shows current numeric value
- ✅ Loading state during API calls
