# Tabs Component Challenge

## You are given

A blank Tabs component template. You must implement it to create a dynamic tabbed interface with product categories.

## Requirements

1. Fetch categories from `https://fakestoreapi.com/products/categories` when component loads
2. Create tabs dynamically from the fetched categories (learn about map())
3. When a tab is clicked, fetch products from `https://fakestoreapi.com/products/category/{category}`
4. Display product titles in the content area
5. Only one tab should be active at a time (learn about state)
6. Handle loading and error states

## API Response Formats

**Categories:**

```json
["electronics", "jewelery", "men's clothing", "women's clothing"]
```

**Products:**

```json
[
    {
        "id": 1,
        "title": "Fjallraven - Foldsack No. 1 Backpack",
        "price": 109.95,
        "category": "men's clothing"
    }
]
```

## What you'll learn

- useEffect: Fetch data when component loads
- Arrays & map(): Create dynamic lists from data
- State: Track active tab and products
- Events: Handle tab clicks
- Multiple API calls: Chain API requests

## Validation Points

- ✅ Fetches category list correctly
- ✅ Clicking tab fetches new data
- ✅ Product titles render in panel
- ✅ Only one active tab at a time
- ✅ Loading states for both API calls
- ✅ Error handling for failed requests
