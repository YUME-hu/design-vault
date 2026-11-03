# Publishing

1. Run `pnpm verify` and make sure it is green.
2. Bump `version` and add the matching `CHANGELOG.md` entry.
3. Inspect the artifact: `npm pack --dry-run`.
4. Configure npm **Trusted Publisher** for this repository:
   - GitHub organization/user and repository
   - Workflow: `release.yml`
   - Allow `npm publish`
5. Commit, open a pull request and merge it.
6. Tag the merged commit:

   ```bash
   git tag v<version>
   git push origin v<version>
   ```

The `release` workflow checks that the tag matches `package.json`, runs `pnpm verify`, and publishes with
provenance. It needs no `NPM_TOKEN`.

For local development, `dsh plugin --profile web add link:$PWD` installs the working copy instead of a
published version.
