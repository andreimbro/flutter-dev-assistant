# Documento dei Requisiti

## Introduzione

Questo documento descrive il refactoring architetturale del progetto **flutter-dev-assistant** per separarlo in tre componenti indipendenti con responsabilità distinte:

1. **MCP Server standalone** — logica core riusabile da qualsiasi IDE (già presente in `mcp-server/`)
2. **Plugin Claude Code** — plugin specifico per Claude Code con comandi thin wrapper che delegano al MCP server
3. **Plugin Kiro** — plugin specifico per Kiro IDE con script di installazione, hook e steering files

Il progetto attuale ha tutta la logica mescolata alla root: `commands/`, `assistants/`, `hooks/`, `skills/`, `.claude-plugin/` e `install-kiro.sh` coesistono senza una separazione netta tra ciò che è specifico di un IDE e ciò che è condiviso.

L'obiettivo è eliminare la duplicazione, centralizzare la logica nel MCP server, e rendere ogni componente distribuibile e manutenibile indipendentemente.

---

## Glossario

- **MCP_Server**: Il server Node.js in `mcp-server/` che implementa il Model Context Protocol e contiene tutta la logica core Flutter
- **Claude_Code_Plugin**: Il plugin specifico per Claude Code, composto da `commands/`, `assistants/`, `.claude-plugin/` e relativi file di configurazione
- **Kiro_Plugin**: Il plugin specifico per Kiro IDE, composto da `hooks/`, `skills/`, `steering/`, `install-kiro.sh` e relativi file di configurazione
- **Thin_Wrapper**: Un comando che non contiene logica propria ma delega l'esecuzione al MCP_Server
- **Plugin_Root**: La directory radice del repository `flutter-dev-assistant/`
- **Workspace**: La directory del progetto Flutter dell'utente finale
- **Steering_File**: File markdown con frontmatter `inclusion: manual` installato in `~/.kiro/steering/` per guidare il comportamento di Kiro
- **Power**: Termine Kiro per un MCP server registrato in `~/.kiro/settings/mcp.json`

---

## Requisiti

### Requisito 1: Separazione della struttura delle directory

**User Story:** Come maintainer del progetto, voglio che ogni componente abbia la propria directory dedicata, così da poter gestire, versionare e distribuire ogni parte indipendentemente.

#### Criteri di Accettazione

1. THE Plugin_Root SHALL contenere esattamente tre directory di primo livello per i componenti: `mcp-server/`, `plugins/claude-code/`, e `plugins/kiro/`
2. THE Plugin_Root SHALL mantenere la directory `docs/` per la documentazione condivisa
3. WHEN un file appartiene esclusivamente a Claude Code, THE Plugin_Root SHALL posizionarlo sotto `plugins/claude-code/`
4. WHEN un file appartiene esclusivamente a Kiro IDE, THE Plugin_Root SHALL posizionarlo sotto `plugins/kiro/`
5. WHEN un file contiene logica core Flutter riusabile, THE Plugin_Root SHALL posizionarlo sotto `mcp-server/`
6. THE Plugin_Root SHALL rimuovere le directory `commands/`, `assistants/`, `hooks/`, `skills/` dalla root dopo la migrazione
7. THE Plugin_Root SHALL rimuovere il file `install-kiro.sh` dalla root dopo la migrazione verso `plugins/kiro/`

---

### Requisito 2: MCP Server come componente standalone

**User Story:** Come sviluppatore che usa Cursor, Windsurf o qualsiasi IDE compatibile MCP, voglio poter usare il MCP server senza installare componenti specifici di Claude Code o Kiro, così da avere accesso alle funzionalità Flutter indipendentemente dall'IDE.

#### Criteri di Accettazione

1. THE MCP_Server SHALL essere eseguibile con `node mcp-server/index.js` senza dipendenze da file fuori dalla propria directory
2. THE MCP_Server SHALL esporre tutti e 6 i tool MCP esistenti: `flutter-verify`, `flutter-security`, `flutter-plan`, `flutter-checkpoint`, `flutter-orchestrate`, `flutter-learn`
3. THE MCP_Server SHALL contenere nella propria directory tutti i file JSON degli assistants (`mcp-server/assistants/`) e dei comandi (`mcp-server/commands/`)
4. THE MCP_Server SHALL avere un `package.json` autonomo con tutte le dipendenze necessarie
5. WHEN il MCP_Server viene installato in un nuovo IDE, THE MCP_Server SHALL funzionare senza richiedere la presenza di `plugins/` o di file alla Plugin_Root
6. THE MCP_Server SHALL mantenere tutti i test esistenti in `mcp-server/__tests__/` funzionanti dopo il refactoring

---

### Requisito 3: Plugin Claude Code come thin wrapper

**User Story:** Come utente di Claude Code, voglio che i comandi slash (`/flutter-verify`, `/flutter-plan`, ecc.) continuino a funzionare esattamente come prima, così da non dover cambiare il mio workflow.

#### Criteri di Accettazione

1. THE Claude_Code_Plugin SHALL contenere tutti i file di configurazione in `plugins/claude-code/.claude-plugin/`
2. THE Claude_Code_Plugin SHALL contenere i comandi markdown in `plugins/claude-code/commands/`
3. WHEN un comando Claude Code esegue un'operazione disponibile nel MCP_Server, THE Claude_Code_Plugin SHALL delegare l'esecuzione al MCP_Server tramite chiamata MCP tool invece di reimplementare la logica
4. THE Claude_Code_Plugin SHALL contenere gli assistants markdown in `plugins/claude-code/assistants/`
5. THE Claude_Code_Plugin SHALL contenere le skills markdown in `plugins/claude-code/skills/` (copia delle skills, non link a `mcp-server/`)
6. THE Claude_Code_Plugin SHALL avere un `plugin.json` alla root del proprio repository dedicato con path relativi corretti (vedi Requisito 7)
7. WHEN il Claude_Code_Plugin viene installato tramite marketplace Claude Code, THE Claude_Code_Plugin SHALL funzionare senza richiedere la presenza di `plugins/kiro/` né di file dalla Plugin_Root del monorepo
8. THE Claude_Code_Plugin SHALL mantenere la compatibilità con tutti gli 8 comandi esistenti: `flutter-verify`, `flutter-plan`, `flutter-checkpoint`, `flutter-orchestrate`, `flutter-learn`, `flutter-security`, `flutter-init`, `flutter-help`

---

### Requisito 4: Plugin Kiro come componente autonomo

**User Story:** Come utente di Kiro IDE, voglio installare il plugin con un singolo script che configura tutto il necessario (MCP server, assistants, hooks, skills), così da avere un'esperienza di installazione coerente e completa.

#### Criteri di Accettazione

1. THE Kiro_Plugin SHALL contenere lo script di installazione in `plugins/kiro/install.sh`
2. THE Kiro_Plugin SHALL contenere tutti gli hook files in `plugins/kiro/hooks/`
3. THE Kiro_Plugin SHALL contenere tutti gli skills files in `plugins/kiro/skills/`
4. THE Kiro_Plugin SHALL contenere tutti gli steering files in `plugins/kiro/steering/`
5. WHEN `plugins/kiro/install.sh` viene eseguito, THE Kiro_Plugin SHALL installare il MCP_Server da `mcp-server/` come Power Kiro
6. WHEN `plugins/kiro/install.sh` viene eseguito, THE Kiro_Plugin SHALL copiare gli assistants markdown in `~/.kiro/steering/` con il frontmatter `inclusion: manual`
7. WHEN `plugins/kiro/install.sh` viene eseguito con `--project`, THE Kiro_Plugin SHALL copiare hooks e skills nella directory `.kiro/` del progetto Flutter target
8. WHEN il Kiro_Plugin viene installato, THE Kiro_Plugin SHALL funzionare senza richiedere la presenza di `plugins/claude-code/`

---

### Requisito 5: Aggiornamento della documentazione

**User Story:** Come nuovo utente del progetto, voglio trovare documentazione chiara sull'architettura modulare e su come installare ogni componente, così da capire rapidamente quale parte mi serve.

#### Criteri di Accettazione

1. THE Plugin_Root SHALL contenere un file `docs/ARCHITECTURE.md` che descrive la struttura a tre componenti e le responsabilità di ciascuno
2. THE Plugin_Root SHALL contenere un file `docs/MCP_SERVER.md` aggiornato con istruzioni per l'uso standalone del MCP server
3. THE Plugin_Root SHALL contenere un file `docs/PLUGIN_CLAUDE_CODE.md` con istruzioni di installazione e configurazione specifiche per Claude Code
4. THE Plugin_Root SHALL contenere un file `docs/PLUGIN_KIRO.md` con istruzioni di installazione e configurazione specifiche per Kiro IDE
5. WHEN un utente legge il `README.md` principale, THE Plugin_Root SHALL presentare chiaramente i tre componenti e i link alla documentazione specifica di ciascuno
6. THE Plugin_Root SHALL aggiornare tutti i path relativi nei file di documentazione esistenti per riflettere la nuova struttura delle directory

---

### Requisito 6: Compatibilità retroattiva e migrazione

**User Story:** Come utente esistente del plugin, voglio che il refactoring non rompa la mia installazione corrente, così da non dover riconfigurare manualmente il mio ambiente.

#### Criteri di Accettazione

1. WHEN un utente ha già installato il plugin tramite marketplace Claude Code, THE Claude_Code_Plugin SHALL continuare a funzionare dopo l'aggiornamento alla versione refactored
2. WHEN un utente ha già eseguito `install-kiro.sh`, THE Kiro_Plugin SHALL fornire un percorso di migrazione documentato verso la nuova struttura
3. THE Plugin_Root SHALL aggiornare il `CHANGELOG.md` con una sezione dedicata al refactoring architetturale che descrive i breaking changes e le istruzioni di migrazione
4. IF un utente esegue `plugins/kiro/install.sh --uninstall`, THEN THE Kiro_Plugin SHALL rimuovere tutti i file installati senza lasciare residui
5. THE Plugin_Root SHALL mantenere tutti i 146 test esistenti nel MCP_Server funzionanti e passanti dopo il refactoring

---

### Requisito 7: Pubblicabilità del Claude Code Plugin come repository GitHub standalone

**User Story:** Come maintainer del progetto, voglio che il Claude Code Plugin sia pubblicabile sul marketplace Claude Code da un repository GitHub dedicato, così da rispettare il requisito del marketplace che richiede che il plugin sia installabile direttamente da un repo GitHub.

#### Criteri di Accettazione

1. THE Claude_Code_Plugin SHALL essere gestito come git subtree del monorepo: `plugins/claude-code/` nel monorepo viene pubblicato come root del repository dedicato `andreimbro/flutter-dev-assistant-claude` tramite `git subtree push --prefix=plugins/claude-code origin-claude main`
2. THE Claude_Code_Plugin SHALL posizionare il `plugin.json` alla root del proprio repository dedicato (ovvero in `plugins/claude-code/.claude-plugin/plugin.json` nel monorepo)
3. WHEN il `plugin.json` è alla root del repository dedicato, THE Claude_Code_Plugin SHALL usare path relativi che non escano dalla propria directory root — nessun path può contenere `../` (es. `"skills": ["skills/"]`, `"commands": ["commands/"]`)
4. THE Claude_Code_Plugin SHALL aggiornare il `marketplace.json` con `"source": "./"` che punta alla root del repository dedicato del plugin
5. WHEN Claude Code risolve i path dal `plugin.json`, THE Claude_Code_Plugin SHALL garantire che tutti i path relativi siano validi rispetto alla root del repository da cui il plugin viene installato
6. THE Plugin_Root SHALL documentare il comando git subtree per sincronizzare `plugins/claude-code/` con il repository dedicato: `git subtree push --prefix=plugins/claude-code origin-claude main`
7. THE Plugin_Root SHALL documentare il setup del remote: `git remote add origin-claude https://github.com/andreimbro/flutter-dev-assistant-claude.git`
8. THE Claude_Code_Plugin SHALL avere un `README.md` alla root del proprio repository dedicato con istruzioni di installazione dal marketplace Claude Code

---

### Requisito 8: Configurazione e path relativi

**User Story:** Come sviluppatore che contribuisce al progetto, voglio che tutti i path nei file di configurazione siano relativi e corretti per la nuova struttura, così da evitare errori di path hardcoded.

#### Criteri di Accettazione

1. THE Claude_Code_Plugin SHALL aggiornare il `plugin.json` con path relativi che non escano dalla propria directory root — nessun path può contenere `../` — e che puntino correttamente a `commands/`, `assistants/` e `skills/` (vedi Requisito 7.3)
2. THE Kiro_Plugin SHALL aggiornare lo script di installazione con path relativi che puntano a `mcp-server/` dalla Plugin_Root
3. WHEN il MCP_Server carica file di configurazione interni (assistants JSON, commands JSON), THE MCP_Server SHALL usare path relativi alla propria directory `mcp-server/`
4. IF un path configurato non esiste al momento dell'installazione, THEN THE Kiro_Plugin SHALL emettere un messaggio di errore descrittivo e interrompere l'installazione
5. THE Plugin_Root SHALL aggiornare `.claudeignore` e `.gitignore` per escludere i file generati dalla nuova struttura
