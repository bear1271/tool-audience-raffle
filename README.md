# Audience Raffle — Offline Share Edition

[中文使用说明](README.zh-CN.md)

Unzip the entire folder, then open `index.html` in Microsoft Edge or Google Chrome. Keep `index.html`, `app.js`, `style.css` and `sample-participants.csv` together. No installation, account or internet connection is required.

## Quick start

1. Click **Admin panel** and enter your event name.
2. Add participants to Registration, Raffle entry or Survey. All three sources share one pool. Use `email | name`, one participant per line, or import CSV/TXT files into the selected source.
3. CSV needs an **Email** column; **Name**, **First Name** and **Last Name** are supported. See `sample-participants.csv`, which contains fictional examples only. Each import replaces that source's draft list. Click **Save pool** after importing all sources.
4. Open **Draw settings** to set the prize quantity for each tier. All tiers default to one prize. Zero disables a tier. Survey weight defaults to 1, so everyone starts with equal chances; set it higher if your event uses bonus entries. The other two sources have weight 1.
5. Click **Save pool**, review the participant counts, close the admin panel, then select a prize tier and click **Draw winners**. You can draw in smaller batches. Each batch allows up to 100 winners.
6. **Full screen** automatically closes the admin panel. Press Esc to exit. Settings and weights are not shown on the audience screen.
7. In the admin panel, review history, mark prizes collected and add notes. Export CSV for winner records and JSON for a complete backup.

## Identity and probability

Email matching ignores case. Repeated submissions within the same source count once. By default, a participant who appears in multiple sources receives the highest source weight. Optional Add source weights mode combines the weights of distinct sources.

One prize per person is enabled by default. Each winner is removed before the next selection and excluded from later draws. Prize tier order affects which prize people can win. Freeze the list, settings and draw order before the live event.

The app uses Web Crypto random values, rejection sampling to avoid modulo bias, and weighted sampling without replacement. For each individual selection, a participant's probability equals their weight divided by the remaining total weight. Final inclusion probabilities across a batch are not necessarily proportional to weights.

You must verify attendance yourself. The app has no automatic attendance check, form synchronization or submission deadline enforcement. It matches emails, not physical identities.

## Data, backups and reset

This package starts with empty lists and no event history. It contains no organizer data. Data you enter is saved in this browser on this device; it does not synchronize. Keep the app in a stable folder, avoid private browsing and export backups regularly. The admin panel is a local operator view, without password protection or a server. Records are not tamper-proof.

**Reset draw** clears winners and draw history while retaining lists, event name and saved settings. All participants become eligible again and tier inventory is restored. **Reset event** clears everything and restores one prize per tier, equal source weights and the default exclusion rule. Both require confirmation. Export before resetting.

Restore backup replaces the current data. Invalid saved lists block drawing instead of silently changing probabilities. JSON backups contain participant emails, source weights and candidate snapshots; share only with authorized organizers.

## Files

- `index.html`: start here.
- `app.js`: lottery logic and browser storage.
- `style.css`: interface styles.
- `sample-participants.csv`: fictional import example.
- `README.md`: English instructions.
- `README.zh-CN.md`: detailed Chinese instructions.

This is a generic offline event tool. Change your event name and prize quantities in the admin panel; no code editing is needed for those settings.

## Development checks

With Node.js installed, run `node --check app.js` and `node tests/lottery.test.cjs`. Node.js is only needed for developer checks; opening the app requires only a browser.
