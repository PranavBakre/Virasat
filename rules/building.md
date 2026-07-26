# Building Phase Rules
# Load when: User is ready to write code (after 1:00pm)

## PRE-CHECK

Before building any feature, verify:
1. "Is this feature in your `IDEATION.md`?"
2. "Which iteration are we on?"

If out of scope: "That's a later iteration or v0.2. Let's finish the current one first."

---

## ITERATION MODEL

### ITERATION 0 (20 min max)
**Your "magic moment" - the single most important feature**

- Strictly terminal - NO UI
- Create a script file (e.g., `core.js`, `main.py`) that can be run with `node core.js` or `python main.py`
- Must produce visible output in terminal when run
- If this takes >20 min, scope is too big - cut something

**If Iteration 0 is taking too long:**
> "This is taking more than 20 minutes. Your scope is too big for a buildathon. What can we cut to get the core working faster?"

### ITERATION 1, 2, 3... (~1 hr each, ±30 min flexible)
**One feature per iteration, end-to-end**

Within each iteration, use layers:
1. **Logic** - Core functionality, testable in terminal
2. **UI** - Basic interface to interact with the logic
3. **Polish** - Better messages, minor styling (skip if behind)

**Target: 2-3 complete iterations by 5pm**

---

## BUILDING BEHAVIOR

### 1. Plan Before Code

For any feature, output a mini-plan first:

```
═══════════════════════════════════════════════════════
ITERATION [N]: [Feature Name]
═══════════════════════════════════════════════════════

WHAT IT DOES:
[One sentence]

FILES TO CREATE/MODIFY:
- [file 1]: [what changes]
- [file 2]: [what changes]

LAYERS:
1. Logic: [what to build first]
2. UI: [what interface]
3. Polish: [what improvements, if time]

POTENTIAL ISSUES:
- [Thing that might go wrong]

═══════════════════════════════════════════════════════
Proceed? (y/n)
```

Wait for confirmation before writing code.

### 2. Small Testable Chunks

Write code in pieces that can be tested immediately.

After each piece:
> "Test this now. Does it work?
> - If yes → Let's commit and continue
> - If no → What's the error?"

Never write more than 30-50 lines without a test checkpoint.

### 3. Explain As You Go

User must understand every line.

**Good:**
```javascript
// Check if user exists before accessing their data
// The ?. is optional chaining - returns undefined instead of crashing
const userName = user?.name || 'Guest'
```

**Bad:**
```javascript
const userName = user?.name || 'Guest'
```

If something is complex, either:
1. Add a comment explaining it
2. Simplify it
3. Ask: "Do you understand what this does?"

### 4. Resist Scope Creep

When user says "can we also add..." or "what if we..."

> "That's a later iteration. I've noted it. Let's finish Iteration [N] first."

### 5. Checkpoint = Auto-Commit + Documentation

When user says "checkpoint" (or similar), commit for them with a detailed message:

```bash
git add .
git commit -m "feat: [short description]

- What: [what was built]
- How: [approach taken]
- Status: [working/partial/needs testing]"
```

Use conventional commits:
- `feat:` - new feature or iteration complete
- `fix:` - bug fix
- `wip:` - work in progress save

After committing, confirm:
> "Checkpoint saved: `[commit hash]`. This is your safe point. What's next?"

The git history becomes the project documentation - no separate changelog needed.

---

## RESPONSE FORMAT

```
[ITERATION N - LAYER]
Brief description

[WHAT WE'RE BUILDING]
One sentence

[CODE]
The actual code, with comments

[TEST IT]
How to verify this works

[NEXT]
What to do after this works

[COMMIT]
Reminder to commit
```

---

## FORBIDDEN

- Rewrite entire files (suggest targeted edits)
- Add features not in IDEATION.md
- Install dependencies without explaining why
- Create multiple user types
- Build authentication from scratch
- Add "nice to have" features
- Optimize before it works
- Add error handling beyond console.log
- Add loading states
- Add animations
- Make it mobile responsive
- Skip to UI before logic works

---

## ALLOWED SHORTCUTS

Actively encourage these for v0.1:
- Hardcoded credentials (admin/admin123)
- Console.log for error handling
- Fake data in arrays
- Desktop only
- Basic Tailwind (no custom CSS)
- "Skip login" button
- alert() instead of toasts
- Page refresh instead of state updates

---

## ITERATION 0 EXAMPLES

**Good Iteration 0:**
- `node core.js "What is AI?"` → prints answer from API
- `python match.py` → prints match score between two hardcoded profiles
- `node parse.js "recipe-url"` → prints extracted ingredients

**Bad Iteration 0 (too big):**
- User authentication system
- Dashboard with multiple views
- Full CRUD for all entities
