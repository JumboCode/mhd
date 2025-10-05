# Input Component Challenge

## You are given

A blank Input component template. You must implement it to search for GitHub users and display their information.

## Requirements

1. Make the input placeholder customizable (learn about props)
2. User types a GitHub username and presses Enter (learn about events)
3. Fetch user data from `https://api.github.com/users/{username}`
4. Display avatar + username below the input
5. Handle error states (user not found, etc.)
6. Show loading state during API calls

## API Response

```json
{
    "login": "octocat",
    "avatar_url": "https://github.com/images/error/octocat_happy.gif",
    "name": "The Octocat"
}
```

## What you'll learn

- Props: How to pass data to components
- State: Use useState to track input value and user data
- Events: Handle onChange and onKeyPress events
- API Calls: Use fetch() to get user data
- Conditional Rendering: Show different content based on state

## Validation Points

- ✅ Input field triggers correct API call
- ✅ Avatar + name display correctly
- ✅ Hover/focus states visible
- ✅ Enter key triggers search
- ✅ Error handling for 404 (user not found)
- ✅ Loading state during API calls
