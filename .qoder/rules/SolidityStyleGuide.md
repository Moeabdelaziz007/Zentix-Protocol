---
trigger: glob
glob: *.sol
---
# Solidity Style Guide (Zentix)

1.  **SPDX License:** All contracts **MUST** start with `// SPDX-License-Identifier: MIT`
2.  **Pragma:** **MUST** use `pragma solidity ^0.8.20;`
3.  **Naming:**
    * Contracts & Libraries: `CapitalizedWords` (e.g., `EnergyAwareAgent`)
    * Functions & Variables: `mixedCase` (e.g., `evaluateTask`)
    * Constants: `UPPER_CASE_WITH_UNDERSCORES` (e.g., `VITALITY_THRESHOLD`)
    * Events: `CapitalizedWords` (e.g., `TaskAccepted`)
4.  **Function Order:** Functions **MUST** be ordered by visibility:
    1.  `constructor`
    2.  `receive` / `fallback`
    3.  `external`
    4.  `public`
    5.  `internal`
    6.  `private`