/**
 * The Gaddr platform contract.
 *
 * The agreement every Gaddr product implements, in both directions: the estate
 * it renders in its navigation, the identity it trusts, the money it takes, the
 * ways a reader reaches a person, and the level at which capability is switched
 * off during an incident. Five files, no dependencies, no framework.
 *
 * **This directory is copied, not imported.** Products live in separate
 * repositories with separate deploy pipelines, and a shared package would make
 * every one of them wait on a publish to change a link. `bun run
 * contract:check` compares the copies and `bun run contract:push` updates them;
 * both refuse to move anything outside this directory.
 *
 * **Nothing here may import anything.** That is what makes the copy work: the
 * receiving product has its own auth library, its own payment code and its own
 * framework, and the contract has to be readable to all of them.
 * `src/__tests__/platform-contract.test.ts` fails on any import statement.
 *
 * Written up in `docs/architecture/platform-contract.md`.
 */

export * from "./billing";
export * from "./estate";
export * from "./identity";
export * from "./security";
export * from "./support";
