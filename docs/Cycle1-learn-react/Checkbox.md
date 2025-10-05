# Checkbox Component Challenge

## You are given

A blank Checkbox component template. You must implement it to fetch todos and track multiple selections.

## Requirements

1. Fetch 5 todos from `https://jsonplaceholder.typicode.com/todos?_limit=5` when component loads
2. Display each todo as a checkbox with its title
3. Allow multiple selection (learn about arrays and state)
4. Display "You selected X items" counter that updates
5. Handle loading and error states
6. Make checkboxes look nice with custom styling

## API Response

```json
[
    {
        "id": 1,
        "title": "delectus aut autem",
        "completed": false
    },
    {
        "id": 2,
        "title": "quis ut nam facilis et officia qui",
        "completed": false
    }
]
```

## What you'll learn

- useEffect: How to fetch data when component loads
- Arrays: Work with arrays of data and map() function
- State: Track selected items and count
- Events: Handle checkbox changes
- Conditional Rendering: Show different states

## Validation Points

- ✅ Correct API call on mount
- ✅ Checkboxes toggle correctly
- ✅ Counter updates dynamically
- ✅ Shows "You selected X items" message
- ✅ Loading state during initial fetch
- ✅ Error handling for API failures
