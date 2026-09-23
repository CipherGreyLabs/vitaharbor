# Scanner queue reconciliation — 2026-09-23

The earlier classifier/provenance change made the public queue appear to drop from 13 items to 8. This follow-up compared the old public snapshot at `6659a91^` with the regenerated queue, checked every missing ID against `data/quarantine.json`, and corrected the cases where valid development evidence had been filtered out.

Result: 3 of the 5 initially missing records were restored. The public queue now contains 11 items. The remaining 2 are accounted for below; neither was silently deleted.

| ID | Current status | Decision and evidence |
|---|---|---|
| `reddit-1wndxal` | `REJECTED`, not public | Confirmed false-positive discussion; append-only state history records the rejection. |
| `reddit-1wn46c9` | `QUARANTINED`, public `project_update` | Concrete BuckshotRoulettePortable WIP with custom-engine/VitaGL evidence. A question about where to post no longer hides a real WIP. |
| `reddit-1wmax82` | `VERIFIED_FOR_REVIEW`, public `project_update` | Manual evidence bundle verifies the linked Resident Evil 4 Vita optimization demo despite the migrated source body being empty. |
| `reddit-1wkf9m5` | `QUARANTINED`, public `project_update` | Concrete SuperTuxKart WIP/Vulkan/FPS evidence. A body question marker no longer overrides the development evidence. |
| `reddit-1wh0klj` | `QUARANTINED`, internal only | Legacy Class of '09 record has no stored body or repository/build evidence. It remains in internal provenance and is withheld until fresh evidence exists; the overlapping curated project was not used as invented proof. |

The reconciliation artifact is also available as [SCANNER_QUEUE_RECONCILIATION_2026-09-23.json](SCANNER_QUEUE_RECONCILIATION_2026-09-23.json). The scanner still never promotes a candidate into the curated ledger automatically.
