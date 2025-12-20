---
inclusion: always
---
Don’t default to useState

If state:

Is derived → don’t store it

Is shared → lift or centralize it

Is temporary UI → local state

Comes from server → server state, not React state

If you reach for useState without asking why, you’re already wrong.

2. Never store derived state

❌ Bad:

const [fullName, setFullName] = useState(first + last);


✅ Correct:

const fullName = `${first} ${last}`;


Derived state causes desync bugs. Period.

3. One source of truth, always

If the same data exists:

in props

in state

in context

You’ve created a bug, not a feature.

4. Lift state only when forced

If two siblings need data → lift
If parent doesn’t use it → don’t lift
If lifting makes parent dumb → create a hook

5. Create custom hooks before Context

90% of context usage is lazy engineering.

Rule:

Logic reuse → custom hook

Global cross-app state → context

Server data → React Query / server actions

6. Split state by reason, not by component

❌ Bad:

const [form, setForm] = useState({ name, email, loading });


✅ Correct:

const [values, setValues] = useState(...)
const [isSubmitting, setIsSubmitting] = useState(false)


State that changes together can live together. Everything else shouldn’t.

7. Boolean explosion = design failure

If you have:

isLoading
isFetching
isSubmitting
isSaving


Replace with:

status: 'idle' | 'loading' | 'success' | 'error'


Finite State Machines win. Always.

8. Prefer useReducer when state has transitions

If state changes depend on previous state → useReducer.

If you’re writing:

setState(prev => ...)


more than twice — stop and refactor.

♻️ REUSABILITY (This separates seniors from juniors)
9. Components should do one thing

If a component:

fetches data

formats data

renders UI

handles side effects

You wrote 4 components in one file.

10. Prefer composition over configuration

❌ Bad:

<Button variant="primary" size="large" />


✅ Better:

<PrimaryButton />


Configuration scales poorly. Composition scales forever.

11. Never hard-code side effects in components

❌ Bad:

useEffect(() => fetchData(), []);


✅ Correct:

useFetchUsers()


Components render. Hooks orchestrate.

12. Props should describe what, not how

❌ Bad:

onClickSubmitFormWithValidation()


✅ Correct:

onSubmit()


Implementation details don’t belong in props.

13. Avoid “utility components”

If a component has no JSX logic → it’s not a component.

Put it in:

/lib

/utils

/services

14. Prefer controlled components

Uncontrolled inputs hide bugs. Controlled inputs expose them early.

⚙️ EFFECTS & PERFORMANCE
15. useEffect is not a lifecycle replacement

If you’re thinking:

“I’ll use useEffect when component loads”

You’re thinking in Angular/React-2017 terms.

Effects are for:

syncing with external systems

subscriptions

imperative APIs

Nothing else.

16. Never suppress ESLint deps warnings

If dependencies cause infinite loops → your logic is wrong, not ESLint.

17. Don’t prematurely memoize

useMemo and useCallback:

are for performance bottlenecks

not for “clean code”

Wrong memoization makes apps slower.

18. Memoize functions passed deep

If a function travels more than 2 levels → memoize it.

🧩 NEXT.JS SPECIFIC (App Router)
19. Server Components by default

Client components are opt-in, not default.

If it doesn’t need:

browser API

state

effects

It does NOT belong in "use client".

20. Fetch on the server unless proven otherwise

Client fetching causes:

loading waterfalls

worse SEO

duplicated logic

Use:

Server Actions

fetch in server components

21. Separate data loading from interaction

Pattern:

Page (server)
 ├── DataFetcher (server)
 │    └── ClientComponent


Clean boundary. Predictable behavior.

22. Never mutate props or server data

If you do this — you don’t understand React.

23. Don’t leak env or secrets to client

If it’s in:

NEXT_PUBLIC_*


assume attackers can read it.

🧱 ARCHITECTURE RULES
24. Folder structure reflects responsibility

Bad:

components/


Good:

features/
  auth/
  dashboard/
  payroll/
shared/


Structure should tell a story.

25. UI ≠ Business Logic

If you can’t move logic to a hook without breaking UI → bad design.

26. No API calls in JSX files

JSX files render. Services fetch.

27. Types first, implementation second

If you write code before types, you’ll rewrite it twice.

28. Fail fast, loudly

Silent failures create support tickets.

Throw errors. Log aggressively. Handle boundaries.

29. Readability > cleverness

If someone can’t understand your code in 30 seconds, it’s bad code.

30. Every abstraction must earn its existence

If removing it:

doesn’t break anything

doesn’t increase duplication

It shouldn’t exist.