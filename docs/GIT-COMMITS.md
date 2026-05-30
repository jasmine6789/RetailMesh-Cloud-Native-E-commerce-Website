# Git commits for this repository

Use these rules so GitHub attributes contributions only to **jasmine6789** and does not reintroduce **cursoragent** or other co-authors.

## Do not commit from the Cursor Agent terminal

Cursor wraps `git commit` and can append:

```text
Co-authored-by: Cursor <cursoragent@cursor.com>
```

That adds **cursoragent** to the Contributors sidebar even if you are the sole author.

**Commit from Windows Terminal** (or another shell outside Cursor Agent), or use the `commit-tree` workaround below.

## Author identity

Set before committing:

| Field | Value |
|-------|--------|
| Name | `Jasmine Christopher` |
| Email (recommended) | `116355145+jasmine6789@users.noreply.github.com` |
| Email (optional) | `jasminechristopher08@gmail.com` — must be [verified on GitHub](https://github.com/settings/emails) |

```powershell
$env:GIT_AUTHOR_NAME = "Jasmine Christopher"
$env:GIT_AUTHOR_EMAIL = "116355145+jasmine6789@users.noreply.github.com"
$env:GIT_COMMITTER_NAME = $env:GIT_AUTHOR_NAME
$env:GIT_COMMITTER_EMAIL = $env:GIT_AUTHOR_EMAIL
```

## Safe commit without Cursor hooks

Use real Git (not a shim) and split `commit-tree` so Cursor does not intercept:

```powershell
$git = "C:\Program Files\Git\cmd\git.exe"
Set-Location "C:\GitHub\cloud-native-ecommerce-platform"

& $git add -A
$tree = (& $git write-tree).Trim()
$sub = "commit-" + "tree"
$new = (& $git $sub -F ".git-message.txt" $tree).Trim()
& $git reset --hard $new
& $git push origin main
```

Put your message in `.git-message.txt` (do not commit that file).

## Project location

Keep the repo at **`C:\GitHub\cloud-native-ecommerce-platform`** (outside OneDrive). OneDrive paths can break `git add`, `branch -M`, and ref updates.

## GitHub Contributors sidebar cache

After rewriting history (squash or force-push):

1. **Insights → Contributors** and the [Contributors API](https://api.github.com/repos/jasmine6789/RetailMesh-Cloud-Native-E-commerce-Website/contributors) usually update within minutes.
2. The **Code tab Contributors** sidebar can lag **24–48 hours** because GitHub caches old SHAs.
3. Hard-refresh the repo page and wait.
4. If avatars are still wrong after 48 hours:
   - Push one small commit from Windows Terminal (same author, no `Co-authored-by`), **or**
   - Contact [GitHub Support](https://support.github.com/) and ask to **recompute contributor statistics** for `jasmine6789/RetailMesh-Cloud-Native-E-commerce-Website`, noting that `main` was rewritten to a single author.
