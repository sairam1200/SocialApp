# Secret scanning — the gate, the allowlist, and how to widen it safely

The secret scan is step four of [`../scripts/ci.sh`](../scripts/ci.sh). It runs
[gitleaks](https://github.com/gitleaks/gitleaks) over the working tree with
[`../.gitleaks.toml`](../.gitleaks.toml), which mirrors the backend config so both
repositories agree on what counts as a finding.

```bash
gitleaks detect --source=. --no-git --config=.gitleaks.toml --redact --no-banner
```

`--no-git` scans the working tree rather than history, so a secret is caught before it
is committed rather than after. `--redact` keeps the value out of terminal scrollback
and CI logs — a scanner that prints the credential it found has moved the leak, not
stopped it.

> **The gate is a pre-commit net, not an audit.** `--no-git` means it never looks at a
> single past commit. A green gate says "nothing is about to be committed", not
> "nothing has been". Those are different claims and the second one is currently
> false — see §6, which has the numbers.

---

## 1. Why there is an allowlist at all

The first run reported 74 findings. All 74 were false: 72 in `.next/` build output,
and two React component names (`LinkedInPreview`, `TwitterPreview`) that the default
`linkedin-client-id` rule read as client IDs.

A gate in that state does not get fixed, it gets bypassed. `--no-verify` becomes
muscle memory and the scanner stops existing in practice. So the allowlist is not a
concession to convenience — it is what keeps the 75th finding, the real one, visible.

The cost is that every allowlist entry is a place the scanner has agreed not to look.
That is why §3 is a procedure rather than a suggestion.

## 2. What is exempt, and why

The config carries two `[[allowlists]]` blocks and two repo-specific rules.

| Exemption | Scope | Reason |
|---|---|---|
| `.next/`, `out/`, `node_modules/`, `coverage/`, `.vercel/` | path | Generated, gitignored, regenerated on every build. 72 of the original 74 findings |
| `yarn.lock`, `package-lock.json` | path | Integrity hashes, not credentials |
| `src/components/svg/**.svg`, `public/` | path | Inlined base64 image data trips high-entropy rules |
| Brand-prefixed PascalCase identifiers | regex | `LinkedInPreview` is a component, not a client ID. Restricted to a component-ish suffix, so a real ID still trips |
| `NEXT_PUBLIC_*` | regex | Inlined into the client bundle by design. Treating a public value as a secret is a category error; the real rule is "never put a secret behind `NEXT_PUBLIC_`", enforced by the first custom rule below |
| `EvaluationMetricKey` comparisons | rule + path + match | See §2a |

And two rules the defaults do not cover, both frontend-specific:

| Rule | Catches |
|---|---|
| `gaddr-server-secret-exposed-to-client` | A server secret behind a `NEXT_PUBLIC_` prefix — `NEXT_PUBLIC_*_SECRET`, `*_PRIVATE_KEY`, `*_DATABASE_URL` and friends |
| `gaddr-platform-token` | A social platform OAuth token (`pina_…`, `ya29.…`, `EAA…`) anywhere in frontend source. These must never reach the client at all |

### 2a. The evaluation metric-key exemption

`generic-api-key` fires on the identifier `key` sitting next to a quoted string, which
makes this line in
[`../src/app/(dashboard)/admin/evaluation/evaluation-ui.util.ts`](<../src/app/(dashboard)/admin/evaluation/evaluation-ui.util.ts>)
read to it as an assignment:

```ts
if (key === "p95LatencyMs") {
```

`p95LatencyMs` is a member of the exported `EvaluationMetricKey` union. The file holds
no secret, and it predates the config — added in `10d0955`, untouched since.

The exemption is scoped three ways, **all** of which must hold:

```toml
targetRules = ["generic-api-key"]   # this rule only
condition   = "AND"                 # every clause below must match, not any of them
paths       = [ the source file, this document, AGENT_LOG.md ]
regexTarget = "match"
regexes     = ['''\bkey === "(precisionAt5|…|p95LatencyMs)"''']
```

So a real key in any of those files still trips the gate, the same comparison in a
neighbouring file still trips it, and a metric added to the union without being added
here also trips it. The last one is deliberate: extending the exemption should cost a
line in `.gitleaks.toml` and a moment's thought, not happen by default.

The path list covers several files rather than one because **writing down a false
positive reproduces it** — this document, `GATE_ROADMAP.md` and the `AGENT_LOG.md` entry
all quote the offending line, and each tripped the rule the moment it landed. That is the
path scoping working. The fix was to name the documents, not to loosen the regex.

### 2b. Not every exemption is equally cheap

Documenting this gate tripped it in two different ways, and only one of them was
allowlisted. The difference is the rule's false-positive rate, and it is the question to
ask before adding any entry:

| Rule | False positives | So documenting it |
|---|---|---|
| `generic-api-key` | Constant — it fires on `key` beside any quoted string | is exempted by path, above |
| `gaddr-server-secret-exposed-to-client` | Essentially none — a match is a design error nearly every time | is **not** exempted. The prose writes `NEXT_PUBLIC_*_SECRET`, which means the same thing to a reader and does not match the rule |

Rewriting a sentence costs one sentence. Exempting the rule that catches server secrets
behind a public prefix — in the documents most likely to discuss exactly that — costs the
rule. When both options are open, change the prose.

## 3. Adding an exemption

1. **Prove it is false.** Open the file and read the line. `--redact` hides the value,
   so get the detail with a JSON report instead:
   ```bash
   gitleaks detect --source=. --no-git --config=.gitleaks.toml --no-banner --report-format=json --report-path=/tmp/leaks.json
   ```
2. **Prefer fixing the code.** An exemption is permanent; renaming a variable is not.
3. **Scope it as narrowly as it will go** — `targetRules` plus `paths` plus a `match`
   regex, with `condition = "AND"`. A bare path exemption blinds the scanner to that
   whole file forever.
4. **Say why in a comment**, next to the entry, including the commit the code came from.
5. **Run the verifier** (§4) and paste its output into the PR.

Never disable a rule repo-wide to silence one finding.

## 4. Verifying the allowlist is not too wide

```bash
./scripts/verify-gitleaks-allowlist.sh
```

A secret scanner fails in two directions and only one is visible. A noisy scan is loud
and gets fixed. A scan that reports nothing because an allowlist is too wide looks
exactly like a scan that reports nothing because the code is clean.

[`../scripts/verify-gitleaks-allowlist.sh`](../scripts/verify-gitleaks-allowlist.sh)
tells the two apart. It copies the tree into a sandbox — never the working tree —
plants a credential in each place one could hide, and asserts on the result:

| | Case | Expected |
|---|---|---|
| A | Committed file, unmodified | clean |
| B | Planted API key in the allowlisted file | **caught** |
| C | The exempted comparison in a different file | **caught** |
| D | A metric key not named in the allowlist | **caught** |
| E | Server secret behind `NEXT_PUBLIC_` | **caught** |
| F | Platform OAuth token in frontend source | **caught** |
| G | Planted API key in this document | **caught** |
| H | Sandbox restored | clean |

Run it whenever `.gitleaks.toml` changes.

> Its planted values are SHA-256 digests of fixed seed words, injected through `printf`
> placeholders so no literal in the script is itself a match. Allowlisting the script's
> own path would have been easier and would have made the one file guaranteed to
> contain credential shapes the one file nobody scans.

## 5. The trap this cost us

The metric-key exemption was first written as:

```toml
matchCondition = "AND"   # wrong key — silently ignored
```

**gitleaks ignores unknown configuration keys without a warning.** The condition never
applied, the allowlist fell back to its `OR` default, and matching the *path alone*
was then enough to exempt the file. Every real credential in it would have passed.

The scan was green the entire time. It was green before the mistake and green after it,
and nothing in the output distinguished the two. Case B is what caught it.

The correct key is `condition`. Two things follow, and they generalise past gitleaks:

- **A green scan is not evidence that a config change worked.** It is equally
  consistent with the change having done nothing.
- **A config format that ignores typos needs a test, not care.** Care is what produced
  the typo.

## 6. What the gate does not cover — history

The gate runs `--no-git`. It has never read a commit. Running it **without** that flag
scans every blob in history instead, and the two answers do not agree:

```bash
gitleaks detect --source=. --config=.gitleaks.toml --redact --no-banner   # no --no-git
```

Measured on 2026-08-07 at `8038269`, 297 commits, ~303 MB:

| Scan | Findings |
|---|---|
| Working tree (`--no-git`, what the gate runs) | **0** |
| Full history (no `--no-git`) | **9** |

The nine are not nine problems. They are two, and they are different in kind:

| Where | What | State |
|---|---|---|
| `env.local` at `f56433d` (2026-08-03) | **8 real credential values** — six `generic-api-key`, one `facebook-secret`, and one `gaddr-platform-token` 101 characters long at entropy 4.93 | Replaced with non-secret values in `9e744ac`, so the working tree is clean — but the originals are still retrievable with `git show f56433d:env.local` by anyone with repository access |
| `README.md` at `84343f7` (2026-06-08) | a `NEXT_PUBLIC_*_SECRET` variable for the SecureLS storage key — a **name**, not a value | The custom rule doing exactly its job: a secret behind a public prefix. Since removed; no reference to it survives anywhere in the tree |

Two things follow.

**The credentials in `f56433d` should be treated as compromised and rotated.** Not
because anyone is known to have taken them, but because "committed to a shared
repository" is the definition of exposed, and rotation is cheap next to the alternative.
Rotation is the fix. Scrubbing history is a separate question and a much worse one:
`git filter-repo` and BFG rewrite every commit hash after the touched one, which breaks
every open branch and working tree in the team, and [`../AGENTS.md`](../AGENTS.md) says
plainly never to force-push or delete a branch to recover from a mistake. Rotate first.
Decide about history second, deliberately, with everyone's trees accounted for.

**`env.local` is tracked and is not in `.gitignore`.** That is the part that will happen
again. The file is committed with placeholder values today, so the next person who fills
it in locally to run something has a real credential staged by default and a gate that,
by design, will catch it — but only if they run the gate. Whether the file should be
tracked at all is a decision with deployment consequences, so it is recorded here rather
than changed in passing. It is item 5 in [`GATE_ROADMAP.md`](GATE_ROADMAP.md) §2.

Neither of these is something the gate can start catching by itself. Scanning full
history on every run costs seconds today and grows with the repository, and it would
report the same nine findings on every run forever until history is rewritten — which is
how a gate teaches people to ignore it. The sane arrangement is the current one plus a
deliberate periodic audit; §7 is that audit.

## 7. Auditing history, and reading a finding

```bash
gitleaks detect --source=. --config=.gitleaks.toml --no-banner \
  --report-format=json --report-path=/tmp/history.json
```

Then read the report **without printing the values**. The JSON carries `Secret` and
`Match` in the clear; a triage that cats the file has just copied every credential into
your scrollback and your shell history.

```bash
python3 - /tmp/history.json <<'PY'
import json, sys, collections
d = json.load(open(sys.argv[1]))
for f in d:
    print(f"{f['RuleID']:38} {f['File']}:{f['StartLine']}  {f['Commit'][:8]}  {f['Date'][:10]}")
    print(f"{'':38} entropy {f['Entropy']:.2f}, length {len(f['Secret'])}")
print(collections.Counter(f['RuleID'] for f in d))
PY
```

That prints rule, location, commit, date, entropy and length — and no value. It is the
command that produced the table in §6; run verbatim it reproduces those nine rows.

Entropy and length are usually enough to sort a real key from a false positive without
looking at the value at all:

| Signal | Reads as |
|---|---|
| Entropy > 4.5, length 32–100, no dictionary words | Almost certainly a real generated credential |
| Entropy ≈ 3.5, length ≈ 12–20, camelCase | Usually an identifier — the `p95LatencyMs` shape from §2a |
| Entropy < 3, very short | Usually a variable name or an example value |
| Matched by `gaddr-platform-token` | Treat as real. That rule matches fixed vendor prefixes (`pina_`, `ya29.`, `EAA`), so it does not fire on shapes — it fires on tokens |

`generic-api-key`, which produces most of the noise, matches on **keyword proximity plus
entropy**: an identifier containing `key`, `api`, `token`, `secret`, `auth`, `pass` or
`cred`, then a delimiter, then a sufficiently random-looking value. That is why the
identifier `key` next to any quoted string is enough to trip it, and why the fix in §2a
had to constrain the *match*, not the file.

## 8. If gitleaks is not installed

`ci.sh` skips the step with a notice rather than failing, so the gate stays runnable
on a machine without it. That means **a green `ci.sh` does not imply the secret scan
ran** — check for the `Secret scan` line in the output.

```bash
brew install gitleaks
```

## Related

| Document | For |
|---|---|
| [`GATE_ROADMAP.md`](GATE_ROADMAP.md) | What the whole gate can and cannot prove, and the ordered path to fixing it |
| [`TOOLCHAIN.md`](TOOLCHAIN.md) | Why `corepack yarn` fails and how the gate runs the tools instead |
| [`COLLABORATION.md`](COLLABORATION.md) | Working in a shared tree — relevant because rewriting history breaks everyone else's |
| [`../AGENTS.md`](../AGENTS.md) | The never-force-push rule that constrains what may be done about §6 |

Verified against gitleaks 8.30.1.
