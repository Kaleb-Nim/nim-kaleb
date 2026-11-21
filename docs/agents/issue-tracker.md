# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues in `Kaleb-Nim/nim-kaleb`. Use the `gh` CLI for all operations. This replaces the old GSD `.planning/` workflow; its final state is preserved at git tag `pre-wayfinder`.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: `gh issue create --parent <parent> ...`, or `gh issue edit <parent> --add-sub-issue <child>` afterwards (`gh` 2.94+). Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (database id, as in **Blocking** below). Without sub-issues, put `Part of #<parent>` at the top of the child body.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v`; `gh` does this automatically when run inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`.
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either: resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue, and its **child** issues are the tickets. The current map is [#5 Portfolio revamp](https://github.com/Kaleb-Nim/nim-kaleb/issues/5), and it replaces the design spec as the reference for what the site should become.

Sub-issues and dependencies take the issue's **database id** (`gh api repos/Kaleb-Nim/nim-kaleb/issues/<n> --jq .id`), not its `#number` or `node_id`. Use the REST calls below: the local `gh` is older than 2.94, so `gh issue create --parent` and `gh issue edit --add-sub-issue` are not available.

- **Map**: one issue labelled `wayfinder:map`, holding the Destination / Notes / Decisions so far / Not yet specified / Out of scope body. Create with `gh issue create --label wayfinder:map`. Find it with `gh issue list --label wayfinder:map --state open`.
- **Child ticket**: a native GitHub sub-issue of the map, labelled `wayfinder:<type>` (`research`, `prototype`, `grilling`, `task`).
  - Create: `gh issue create --label wayfinder:task --title "..." --body "..."`, then link it with `gh api --method POST repos/Kaleb-Nim/nim-kaleb/issues/<map>/sub_issues -F sub_issue_id=<child-db-id>`.
  - List: `gh api repos/Kaleb-Nim/nim-kaleb/issues/<map>/sub_issues --jq '.[] | {number, title, state, assignees: [.assignees[].login]}'`.
- **Blocking**: GitHub's native issue dependencies.
  - Add an edge: `gh api --method POST repos/Kaleb-Nim/nim-kaleb/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`.
  - Read: `gh api repos/Kaleb-Nim/nim-kaleb/issues/<n>/dependencies/blocked_by --jq '.[] | {number, state}'`. `issue_dependencies_summary.blocked_by` on the issue counts open blockers only, so it is the live gate.
  - A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open sub-issues in map order, then drop any with an open blocker or an assignee. The first one left wins.
- **Claim**: `gh issue edit <n> --add-assignee @me`. This is the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then append one line (gist + link) to the map's "Decisions so far".
- **Editing the map**: several sessions may edit the map at once. Re-fetch the body (`gh issue view <map> --json body -q .body`) right before each edit, change only your own lines, and write it back straight away (`gh issue edit <map> --body-file <file>`).
- **Delivery**: code and doc changes go in a PR to `main` on a branch named after the ticket. Mention `#<ticket>` in the PR body.
