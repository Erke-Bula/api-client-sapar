# Laboratory Work 6 — API Client

## Student
Sapar Erkebulan

## Repository
api-client-sapar

## API Used
Open Library API

## Base URL
https://openlibrary.org/

## Endpoints
Search: https://openlibrary.org/search.json

Details: https://openlibrary.org/works/{workId}.json

## What the application does
This application loads books from the Open Library API, uses `fetch()` and `async/await` to request data, supports API-based search, loads details with a second request for a selected book, performs two independent requests in parallel with `Promise.all()`, and displays loading and error states directly in the page.

## async/await explanation
The `await` keyword pauses an `async` function until a Promise resolves. This makes asynchronous API calls easier to read and manage in a simple, beginner-friendly way. `async` functions are useful because browser requests take time, and the code should not stop the whole page while waiting. Without asynchronous requests, the user interface would freeze while data is being downloaded.

## Why response.ok is checked
The `fetch()` function does not throw an error for HTTP status codes like 404 or 500. It only rejects when the network fails, so the application checks `response.ok` and throws a custom error when the server response is unsuccessful. This helps the app show a clear error message instead of silently failing.

## Error handling
The application uses `try/catch` around API operations. If a request fails, the page hides the loading indicator and shows a clear message in the error area. This helps the user understand that the request failed and gives feedback inside the app instead of using `alert()`.

## Promise.all
`Promise.all()` is used to launch two independent requests at the same time. It waits until both requests finish, so the app can display JavaScript and Python book results together without blocking one request behind the other.

## Technologies
- HTML
- CSS
- JavaScript
- Fetch API
- async/await
- Promise
- Promise.all
- Open Library REST API

## AI Tools Used
- ChatGPT
- VS Code AI / GitHub Copilot

## Screenshot
The screenshot file can initially be a placeholder only if an actual screenshot cannot be generated yet. This project includes a placeholder PNG file in the `screenshots` folder.
