PROJECT CODING RULES & STANDARDS

1. COMPONENT STYLE (LEAN & CLEAN)
   - Keep components extremely simple.
   - Use "Plain Function Components" only.
   - Format: `const ComponentName = (props) => { return <div>...</div> };`
   - NO complex class-based components or factories.

3. PROPS & TYPES
   - Use simple TypeScript interfaces for props.
   - Keep prop names short and descriptive (e.g., `title`, `items`, `isActive`).
   - If props are simple, you can skip the interface and just type them inline in the function arguments.

4. JSX SYNTAX
   - Use lowercase for standard HTML tags (`<div>`, `<span>`).
   - Use PascalCase only for custom Components (`<MyCard />`).

6. LOGIC
   - Use standard JavaScript `.map()` for lists.
   - Use standard ternary operators `condition ? true : false` for conditionals.
   - Keep logic inside the component function or in simple helper functions.

7. ROUTING (HONO)
   - Define routes clearly: `app.get('/', (c) => { ... })`.
   - Render components using `c.html(<Component />)`.

8. CODE GENERATION GOAL
   - Prioritize readability and simplicity.
   - Avoid "clever" code or over-engineering.
   - If a component fits in 5 lines, do not expand it to 20.