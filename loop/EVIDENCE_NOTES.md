Added typed evidence map support in lib/loop.ts and a static JSON export in lib/evidence.ts.
Ring detail now renders data-testid="iteration-evidence" only when the selected iteration has evidence.
Evidence lines include run id, muted three-line root cause, fix target, and target=_blank rel=noopener anchors.
Verified npm run build passes on Next.js 16.2.10; deviation: none.
