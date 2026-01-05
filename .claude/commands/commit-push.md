---
description: Commit and push changes with linting
---

Create a git commit and push to remote. Follow this process carefully:

1. **Run Linting First** - MANDATORY:
   - Run `pnpm lint` to check for linting errors
   - If there are any errors or warnings, FIX THEM before proceeding
   - Run the lint command again to verify all issues are resolved
   - DO NOT skip this step - linting must be clean before committing

2. **Create Commit** - Follow the Git Safety Protocol:
   - Run `git status` to see all untracked files
   - Run `git diff` to see both staged and unstaged changes
   - Run `git log -5 --oneline` to see recent commit message style
   - Analyze all changes and draft a commit message following repository
     conventions
   - Add relevant files to staging area
   - Create commit with message ending with:

     ```
     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```

   - Run `git status` after commit to verify success

3. **Push to Remote**:
   - Run `git push` to push the commit to remote
   - Confirm push was successful

IMPORTANT:

- Never skip the linting step
- Never commit with linting errors
- Follow the repository's commit message style
- Always use the Co-Authored-By footer
