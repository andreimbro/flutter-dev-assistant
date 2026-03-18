# Piano di Implementazione: Refactoring Architetturale Modulare

## Overview

Migrazione del monorepo `flutter-dev-assistant` dalla struttura flat attuale alla struttura modulare a tre componenti (`mcp-server/`, `plugins/claude-code/`, `plugins/kiro/`), con setup del workflow git subtree per la pubblicazione del plugin Claude Code sul marketplace.

## Tasks

- [x] 1. Creare la struttura directory `plugins/` e migrare i file del plugin Claude Code
  - Creare `plugins/claude-code/commands/`, `plugins/claude-code/assistants/`, `plugins/claude-code/.claude-plugin/`
  - Spostare tutti gli 8 file `commands/*.md` in `plugins/claude-code/commands/`
  - Spostare tutti gli 11 file `assistants/*.md` in `plugins/claude-code/assistants/`
  - Spostare `.claude-plugin/plugin.json` e `.claude-plugin/marketplace.json` in `plugins/claude-code/.claude-plugin/`
  - _Requirements: 1.1, 1.3, 1.6, 3.1, 3.2, 3.4_

- [x] 2. Creare `plugins/claude-code/skills/` con copia delle skills markdown
  - Creare la directory `plugins/claude-code/skills/`
  - Copiare tutti i 23 file `skills/*.md` in `plugins/claude-code/skills/`
  - _Requirements: 3.5, 7.3_

- [x] 3. Aggiornare `plugins/claude-code/.claude-plugin/plugin.json` con path standalone
  - Rimuovere qualsiasi path con `../` dal `plugin.json`
  - Impostare `"commands": ["commands/"]`, `"skills": ["skills/"]`
  - Impostare `"agents"` con path relativi alla root `plugins/claude-code/` (es. `"assistants/flutter-architect.md"`)
  - Aggiornare `marketplace.json` con `"source": "./"` se necessario
  - _Requirements: 3.6, 7.2, 7.3, 7.4, 8.1_

  - [x] 3.1 Scrivere property test per Property 3 (path nel plugin.json sono validi e standalone)
    - Verificare che ogni path in `agents`, `skills`, `commands` risolva a file/directory esistente relativo a `plugins/claude-code/`
    - Verificare che nessun path contenga `../`
    - **Property 3: I path nel plugin.json sono validi e standalone**
    - **Validates: Requirements 3.1, 3.5, 7.1, 7.3, 8.1**

- [x] 4. Migrare i file del plugin Kiro in `plugins/kiro/`
  - Creare `plugins/kiro/hooks/`, `plugins/kiro/skills/`, `plugins/kiro/steering/`
  - Spostare tutti gli 8 file `hooks/*.kiro.hook` e `hooks/hooks.json` in `plugins/kiro/hooks/`
  - Spostare tutti i 23 file `skills/*.md` in `plugins/kiro/skills/`
  - Spostare tutti i 7 file `steering/*.md` in `plugins/kiro/steering/`
  - _Requirements: 1.1, 1.4, 1.6, 4.2, 4.3, 4.4_

- [x] 5. Creare `plugins/kiro/install.sh` con path relativi aggiornati e flag `--uninstall`
  - Spostare `install-kiro.sh` in `plugins/kiro/install.sh`
  - Aggiornare il calcolo di `PLUGIN_ROOT` usando `SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"` e `PLUGIN_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"`
  - Aggiornare tutti i path interni per usare `$PLUGIN_ROOT/mcp-server/` come sorgente
  - Aggiungere il flag `--uninstall` che rimuove tutti i file installati da `~/.kiro/` senza lasciare residui
  - Aggiungere validazione: se `$MCP_SERVER_DIR/index.js` non esiste, emettere errore descrittivo e uscire con codice non-zero
  - _Requirements: 1.7, 4.1, 4.5, 4.6, 4.7, 6.4, 8.2, 8.4_

  - [x] 5.1 Scrivere property test per Property 4 (install.sh usa path relativi corretti)
    - Verificare che `PLUGIN_ROOT` calcolato da `plugins/kiro/` punti alla directory radice del monorepo
    - Verificare che `$PLUGIN_ROOT/mcp-server/index.js` esista
    - **Property 4: Lo script di installazione usa path relativi corretti**
    - **Validates: Requirements 4.1, 4.5, 7.2**

  - [x] 5.2 Scrivere property test per Property 5 (installazione Kiro è idempotente)
    - Simulare due esecuzioni consecutive di `install.sh` in ambiente temporaneo
    - Verificare che lo stato finale sia identico dopo la prima e la seconda esecuzione
    - **Property 5: Installazione Kiro è idempotente**
    - **Validates: Requirements 4.5, 4.6, 4.7**

  - [x] 5.3 Scrivere property test per Property 6 (uninstall rimuove tutti i file installati)
    - Eseguire `install.sh`, poi `install.sh --uninstall`
    - Verificare che nessun file installato rimanga in `~/.kiro/`
    - **Property 6: Uninstall rimuove tutti i file installati**
    - **Validates: Requirements 6.4**

- [x] 6. Checkpoint — Verificare struttura directory e path
  - Assicurarsi che tutte le directory `plugins/claude-code/` e `plugins/kiro/` siano popolate correttamente
  - Verificare che `plugin.json` non contenga path con `../`
  - Chiedere all'utente se ci sono domande prima di procedere con i test di regressione.

- [x] 7. Eseguire i test di regressione del MCP server
  - Eseguire `cd mcp-server && npm test -- --run` e verificare che tutti i 146 test passino
  - Correggere eventuali regressioni introdotte dal refactoring (nessuna modifica attesa al codice del server)
  - _Requirements: 2.6, 6.5_

  - [x] 7.1 Scrivere property test per Property 2 (i test esistenti rimangono passanti)
    - Verificare programmaticamente che il conteggio dei test passanti sia >= 146
    - **Property 2: I test esistenti rimangono passanti**
    - **Validates: Requirements 2.6, 6.5**

- [x] 8. Scrivere i test di struttura directory post-refactoring
  - Creare `mcp-server/__tests__/directory-structure.test.js`
  - Aggiungere test che verificano la presenza di tutti gli 8 comandi in `plugins/claude-code/commands/`
  - Aggiungere test che verificano la presenza di tutti gli 11 assistants in `plugins/claude-code/assistants/`
  - Aggiungere test che verificano la presenza di tutti i 23 file skills in `plugins/claude-code/skills/` e `plugins/kiro/skills/`
  - Aggiungere test che verificano la presenza di hooks, steering in `plugins/kiro/`
  - Aggiungere test che verificano l'assenza delle directory `commands/`, `assistants/`, `hooks/`, `skills/`, `steering/` dalla root
  - _Requirements: 1.1, 1.6, 3.2, 3.4, 3.5, 4.2, 4.3, 4.4_

  - [x] 8.1 Scrivere property test per Property 8 (tutti i comandi Claude Code sono presenti)
    - Verificare che `plugins/claude-code/commands/` contenga esattamente i 8 file attesi
    - **Property 8: Tutti i comandi Claude Code sono presenti**
    - **Validates: Requirements 3.7**

  - [x] 8.2 Scrivere property test per Property 7 (indipendenza tra plugin)
    - Verificare che nessun file in `plugins/claude-code/` referenzi path in `plugins/kiro/` e viceversa
    - **Property 7: Indipendenza tra plugin**
    - **Validates: Requirements 3.6, 4.8**

  - [x] 8.3 Scrivere property test per Property 1 (MCP server è autosufficiente)
    - Verificare che nessun `require()` o `import` in `mcp-server/` referenzi path fuori dalla propria directory
    - **Property 1: MCP Server è autosufficiente**
    - **Validates: Requirements 2.1, 2.3, 2.5, 7.3**

- [x] 9. Rimuovere le directory vecchie dalla root
  - Rimuovere `commands/` dalla root dopo aver verificato che i file siano in `plugins/claude-code/commands/`
  - Rimuovere `assistants/` dalla root dopo aver verificato che i file siano in `plugins/claude-code/assistants/`
  - Rimuovere `hooks/` dalla root dopo aver verificato che i file siano in `plugins/kiro/hooks/`
  - Rimuovere `skills/` dalla root dopo aver verificato che i file siano in entrambe le destinazioni
  - Rimuovere `steering/` dalla root dopo aver verificato che i file siano in `plugins/kiro/steering/`
  - Rimuovere `install-kiro.sh` dalla root dopo aver verificato che `plugins/kiro/install.sh` sia funzionante
  - Rimuovere `.claude-plugin/` dalla root dopo aver verificato che i file siano in `plugins/claude-code/.claude-plugin/`
  - _Requirements: 1.6, 1.7_

- [x] 10. Setup git subtree e documentazione workflow pubblicazione
  - Aggiungere il remote `origin-claude`: `git remote add origin-claude https://github.com/andreimbro/flutter-dev-assistant-claude.git`
  - Documentare il comando di push nel file `docs/technical/ARCHITECTURE.md`: `git subtree push --prefix=plugins/claude-code origin-claude main`
  - Creare `plugins/claude-code/README.md` con istruzioni di installazione dal marketplace Claude Code
  - _Requirements: 7.1, 7.6, 7.7, 7.8_

- [x] 11. Aggiornare la documentazione
  - Aggiornare `docs/technical/ARCHITECTURE.md` con la descrizione della struttura a tre componenti e le responsabilità di ciascuno
  - Aggiornare `docs/technical/MCP_SERVER.md` con istruzioni per l'uso standalone
  - Creare `docs/installation/PLUGIN_CLAUDE_CODE.md` con istruzioni di installazione per Claude Code
  - Creare `docs/installation/PLUGIN_KIRO.md` con istruzioni di installazione per Kiro IDE
  - Aggiornare `README.md` principale con presentazione dei tre componenti e link alla documentazione specifica
  - Aggiornare tutti i path relativi nei file di documentazione esistenti per riflettere la nuova struttura
  - Aggiornare `CHANGELOG.md` con sezione dedicata al refactoring: breaking changes e istruzioni di migrazione per utenti esistenti
  - Aggiornare `.claudeignore` e `.gitignore` per escludere file generati dalla nuova struttura
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.2, 6.3, 8.5_

- [x] 12. Checkpoint finale — Verificare che tutti i test passino
  - Eseguire `cd mcp-server && npm test -- --run` e verificare che tutti i test (inclusi i nuovi) passino
  - Verificare che la struttura directory corrisponda al design target
  - Chiedere all'utente se ci sono domande prima di considerare il refactoring completato.

## Note

- I task contrassegnati con `*` sono opzionali e possono essere saltati per un MVP più rapido
- Ogni task referenzia i requisiti specifici per la tracciabilità
- I checkpoint garantiscono la validazione incrementale
- I property test validano le proprietà di correttezza universali definite nel design
- I test di regressione (146 test esistenti) sono il principale guard di sicurezza per il refactoring
