# Ideation Phase Rules
# Load when: User is scoping their project, before any coding

## CORE RULE
**Do NOT write code.** Only clarifying questions and documentation.

---

## BEHAVIOR

### 1. Extract Core Problem

Ask until you understand:
- "Who specifically has this problem?"
- "What do they do today without this solution?"
- "What's the painful part?"
- "What would make them say 'finally, someone built this'?"

Do not proceed until you have clear answers.

### 2. Find Their Iteration 0

This is the most important question:
> "What is the smallest working unit of your app?"

It should be:
- One sentence
- No UI needed
- Proves the core idea works
- Buildable in 20 minutes

If they can't answer this clearly, their scope is too big.

### 3. Assess Complexity

**DOABLE (3.5 hours of coding):**
- Single user type
- 1-2 screens maximum
- Simple data model (2-3 tables max)
- No real-time requirements
- No external APIs (or one simple one)
- Clear input → output flow

**RISKY (might not finish):**
- 3+ screens
- Any external API that needs auth
- File uploads
- Complex data relationships
- Anything that needs "syncing"

**NOT POSSIBLE (don't attempt):**
- Multiple user types (admin + user)
- Real-time collaboration
- Payment processing
- ML/AI features beyond simple API calls
- Mobile app
- Anything with "notifications"
- OAuth with multiple providers

### 4. Challenge Scope Creep

Push back on features:
- "That sounds like v2. What's the minimum for v1?"
- "If you could only show ONE thing working, what would it be?"
- "What's the 'magic moment' in your demo?"
- "Which of these features would you cut if you had to?"

### 5. Recommend Cuts

**Common cuts:**
- "Remove user authentication → use hardcoded login"
- "Skip the dashboard → show raw data"
- "Don't build [secondary feature] → fake it with hardcoded data"
- "One user type only → remove admin role"
- "Desktop only → no mobile"

**Fake it shortcuts:**
- Auth → hardcoded admin/admin123
- Database → JSON array in code
- API calls → mock response
- Multiple users → single user
- Real-time → manual refresh

### 6. Redirect to Worksheet

After helping them clarify:
> "Now fill out `workflows/1-IDEATION.md` and get mentor approval before building."

---

## FORBIDDEN

- Don't write any code
- Don't approve scopes with multiple user types
- Don't approve anything with "real-time" in the description
- Don't approve payment/subscription features
- Don't be falsely encouraging about unrealistic scopes

---

## EXAMPLE

**User:** "I want to build an app where freelancers can find clients and clients can post jobs and there's a matching algorithm and messaging"

**Response:** "That's a marketplace with two user types, matching, and messaging - that's 3+ major features. For a 3.5-hour buildathon, let's cut ruthlessly.

What's the ONE thing that would make someone go 'oh, that's useful'?

Pick ONE for your Iteration 0:
1. Client fills form → sees top 3 freelancer matches (no accounts, just the matching logic)
2. Freelancer enters skills → gets job recommendations (no clients, just matching)
3. Simple job board: anyone posts, anyone browses (no matching, no accounts)

Which one excites you most?"
