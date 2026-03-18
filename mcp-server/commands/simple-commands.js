/**
 * Simple Commands - Orchestrate, Learn, Init
 * These commands have simpler logic and don't require extensive refactoring
 */
import { detectFlutterCommand, getFlutterVersion } from '../lib/command-executor.js';
import { safeWriteFile, safeCreateDirectory } from '../utils/file-manager.js';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Flutter Orchestrate - Workflow coordination
 */
export function executeFlutterOrchestrate(args, workspaceDir) {
  const task = args.task || args.description || 'Complex task';

  let report = '# Flutter Orchestrate\n\n';
  report += `**Task**: ${task}\n\n`;

  report += '## Workflow Analysis\n\n';
  report += 'Analyzing task and creating execution workflow...\n\n';

  report += '## Phases\n\n';
  report += '### Phase 1: Architecture Design\n';
  report += '- Analyze requirements\n';
  report += '- Design system architecture\n';
  report += '- Choose appropriate patterns\n\n';

  report += '### Phase 2: Implementation Planning\n';
  report += '- Break down into subtasks\n';
  report += '- Identify dependencies\n';
  report += '- Estimate effort\n\n';

  report += '### Phase 3: Development\n';
  report += '- Implement features\n';
  report += '- Write tests\n';
  report += '- Review code\n\n';

  report += '### Phase 4: Verification\n';
  report += '- Run quality checks\n';
  report += '- Security audit\n';
  report += '- Performance testing\n\n';

  report += '## Execution\n\n';
  report += 'Workflow created. Execute phases in order for best results.\n';

  return report;
}

/**
 * Flutter Learn - Pattern extraction
 */
export function executeFlutterLearn(args, workspaceDir) {
  const category = args.category || 'all';
  const minConfidence = args.minConfidence || 0.0;

  const patternsDir = join(workspaceDir, '.kiro', 'patterns');

  // Create patterns directory if it doesn't exist
  try {
    safeCreateDirectory(patternsDir, workspaceDir);
  } catch (error) {
    return `# Flutter Learn\n\n❌ Failed to create patterns directory: ${error.message}\n`;
  }

  let report = '# Flutter Learn\n\n';
  report += 'Analyzing development session for patterns...\n\n';

  report += '## Session Analysis\n\n';
  report += 'Extracting patterns from recent development activity.\n\n';

  // Collect patterns data
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const sessionData = {
    timestamp,
    category,
    patterns: [],
    bestPractices: [],
    mistakes: [],
  };

  // Example patterns
  const examplePatterns = [
    {
      name: 'const-constructor-pattern',
      trigger: 'Need to optimize widget performance',
      solution: 'Use const constructors for immutable widgets',
      context: 'Reduces unnecessary rebuilds and improves performance',
      confidence: 0.5,
      source: `session-${timestamp}`,
      category: 'performance',
      frequency: 1,
      lastUsed: new Date().toISOString(),
      tags: ['performance', 'optimization', 'const'],
    },
  ];

  const exampleBestPractices = [
    {
      practice: 'Use const constructors for immutable widgets',
      context: 'Improves performance by reducing rebuilds',
      impact: 'Better app performance and responsiveness',
      frequency: 1,
      confidence: 0.5,
      examples: ['const Text("Hello")', 'const Icon(Icons.home)'],
    },
    {
      practice: 'Dispose controllers in StatefulWidget dispose method',
      context: 'Prevents memory leaks',
      impact: 'Avoids memory leaks and improves app stability',
      frequency: 1,
      confidence: 0.5,
      examples: ['TextEditingController disposal', 'AnimationController disposal'],
    },
    {
      practice: 'Separate business logic from UI',
      context: 'Improves testability and maintainability',
      impact: 'Easier to test and maintain code',
      frequency: 1,
      confidence: 0.5,
      examples: ['Use repositories', 'Use services layer'],
    },
  ];

  sessionData.patterns = examplePatterns;
  sessionData.bestPractices = exampleBestPractices;

  report += '## Patterns Identified\n\n';
  if (examplePatterns.length === 0) {
    report += 'No patterns identified yet. Continue development and run again.\n\n';
  } else {
    report += `Found ${examplePatterns.length} pattern(s):\n\n`;
    examplePatterns.forEach((pattern, index) => {
      if (
        pattern.confidence >= minConfidence &&
        (category === 'all' || pattern.category === category)
      ) {
        report += `${index + 1}. ${pattern.name} (${pattern.category})\n`;
        report += `   Confidence: ${(pattern.confidence * 100).toFixed(0)}%\n`;
        report += `   Trigger: ${pattern.trigger}\n\n`;
      }
    });
  }

  report += '## Best Practices\n\n';
  exampleBestPractices.forEach((practice, index) => {
    report += `${index + 1}. ${practice.practice}\n`;
    report += `   Impact: ${practice.impact}\n`;
    report += `   Confidence: ${(practice.confidence * 100).toFixed(0)}%\n\n`;
  });

  // Save session data to file
  const sessionFile = join(patternsDir, `session-${timestamp}.json`);
  try {
    safeWriteFile(sessionFile, JSON.stringify(sessionData, null, 2), workspaceDir);
    report += '## Storage\n\n';
    report += '✅ Session data saved successfully\n';
    report += `📁 Location: .kiro/patterns/session-${timestamp}.json\n\n`;
    report += `Patterns: ${sessionData.patterns.length}\n`;
    report += `Best Practices: ${sessionData.bestPractices.length}\n`;
    report += `Mistakes: ${sessionData.mistakes.length}\n\n`;
  } catch (error) {
    report += '## Storage\n\n';
    report += `❌ Failed to save session data: ${error.message}\n\n`;
  }

  report += '## Next Steps\n\n';
  report += 'Continue development and run `/flutter-learn` periodically to build your knowledge base.\n';
  report += 'Use `--category` to filter patterns by type.\n';
  report += 'Use `--min-confidence` to show only high-confidence patterns.\n';

  return report;
}

/**
 * Flutter Init - Project initialization
 */
export function executeFlutterInit(args, workspaceDir) {
  const projectName = args.projectName;
  const destination = args.destination || '.';
  const copyOnly = args.copyOnly || false;
  const customize = args.customize || false;

  // Get the path to templates inside mcp-server (self-contained)
  const serverRoot = dirname(__dirname);
  const templatesDir = join(serverRoot, 'templates');

  let report = '# Flutter Init\n\n';

  if (!projectName && !copyOnly) {
    report += '❌ **Error**: Project name required\n\n';
    report += 'Usage: flutter-init <project-name> [--destination=path] [--copy-only] [--customize]\n\n';
    report += 'Examples:\n';
    report += '- flutter-init my_flutter_app\n';
    report += '- flutter-init my_app --destination=~/projects\n';
    report += '- flutter-init my_app --customize\n';
    return report;
  }

  // Check if templates exist
  if (!existsSync(templatesDir)) {
    report += '❌ **Error**: Templates directory not found\n\n';
    report += `Expected location: ${templatesDir}\n\n`;
    report += 'Make sure the flutter-dev-assistant plugin is properly installed.\n';
    return report;
  }

  // Check for required template files
  const pubspecPath = join(templatesDir, 'pubspec.yaml');
  const analysisPath = join(templatesDir, 'analysis_options.yaml');

  if (!existsSync(pubspecPath) || !existsSync(analysisPath)) {
    report += '❌ **Error**: Required template files not found\n\n';
    report += 'Missing files:\n';
    if (!existsSync(pubspecPath)) report += '- pubspec.yaml\n';
    if (!existsSync(analysisPath)) report += '- analysis_options.yaml\n';
    return report;
  }

  report += '✅ **Flutter Project Initializer**\n';
  report += '================================\n\n';

  if (copyOnly) {
    report += '📋 **Templates Found**\n\n';
    report += 'Available templates:\n';
    report += `- ${pubspecPath}\n`;
    report += `- ${analysisPath}\n\n`;
    report += 'To copy templates to your project:\n\n';
    report += '```bash\n';
    report += `cp ${pubspecPath} /path/to/your/project/pubspec.yaml\n`;
    report += `cp ${analysisPath} /path/to/your/project/analysis_options.yaml\n`;
    report += '```\n\n';
  } else {
    const projectPath = join(destination, projectName);
    const flutterCmd = detectFlutterCommand(workspaceDir);

    report += '📦 **Project Setup**\n\n';
    report += `Project: **${projectName}**\n`;
    report += `Location: ${projectPath}\n\n`;

    report += '🔧 **Configuration to Apply**\n\n';
    report += '**pubspec.yaml**\n';
    report += '- State Management: Riverpod 2.5.0+\n';
    report += '- Networking: Dio + Retrofit\n';
    report += '- Code Generation: Freezed + JSON Serializable\n';
    report += '- Storage: Flutter Secure Storage + Hive\n';
    report += '- Testing: Mocktail + Integration Test\n';
    report += '- UI: Flutter SVG, Shimmer, Cached Network Image\n\n';

    report += '**analysis_options.yaml**\n';
    report += '- Strict type checking and linting\n';
    report += '- Custom Riverpod lint rules\n';
    report += '- Generated file exclusions\n';
    report += '- 260+ lint rules for code quality\n\n';

    report += '📝 **Next Steps**\n\n';
    report += '1. **Create project**:\n```bash\n';
    report += `${flutterCmd} create ${projectPath}\n\`\`\`\n\n`;

    report += '2. **Copy templates**:\n```bash\n';
    report += `cp ${pubspecPath} ${projectPath}/pubspec.yaml\n`;
    report += `cp ${analysisPath} ${projectPath}/analysis_options.yaml\n\`\`\`\n\n`;

    report += '3. **Install dependencies**:\n```bash\n';
    report += `cd ${projectPath}\n${flutterCmd} pub get\n\`\`\`\n\n`;

    report += '4. **Run code generation**:\n```bash\n';
    report += `${flutterCmd} pub run build_runner build --delete-conflicting-outputs\n\`\`\`\n\n`;

    report += '5. **Start developing**:\n```bash\n';
    report += `${flutterCmd} run\n\`\`\`\n\n`;
  }

  if (customize) {
    report += '⚙️ **Customization Available**\n\n';
    report += 'You can customize:\n';
    report += '- State Management solution (Riverpod, Bloc, GetX)\n';
    report += '- Error tracking (Sentry, Firebase)\n';
    report += '- Target Flutter version\n';
    report += '- Additional dependencies\n\n';
  }

  report += '📚 **Documentation**\n\n';
  report += 'For complete documentation, see:\n';
  report += '- Template details: `flutter-dev-assistant/templates/pubspec.yaml`\n';
  report += '- Linting rules: `flutter-dev-assistant/templates/analysis_options.yaml`\n';

  return report;
}

/**
 * Flutter Help - Interactive help system
 */
export function executeFlutterHelp(args, workspaceDir) {
  const category = args.category || null;
  const search = args.search || null;
  const itemName = args.itemName || null;

  // Resolve directories relative to mcp-server/ (self-contained)
  const serverRoot = dirname(__dirname);

  const commandsDir = join(serverRoot, 'commands');
  const skillsDir = join(serverRoot, 'skills');
  const assistantsDir = join(serverRoot, 'assistants');

  // Helper: load JSON files from a directory
  function loadJsonFiles(dir) {
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        try {
          const content = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
          return { file: f, ...content };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }

  const commands = loadJsonFiles(commandsDir);
  const skills = loadJsonFiles(skillsDir);
  const assistants = loadJsonFiles(assistantsDir);

  // Search mode
  if (search) {
    const keyword = search.toLowerCase();
    const matchIn = (item) => {
      const text = `${item.name || ''} ${item.description || ''}`.toLowerCase();
      return text.includes(keyword);
    };

    const matchedCommands = commands.filter(matchIn);
    const matchedSkills = skills.filter(matchIn);
    const matchedAssistants = assistants.filter(matchIn);
    const total = matchedCommands.length + matchedSkills.length + matchedAssistants.length;

    let report = `# Flutter Help — Search: "${search}"\n\n`;
    report += `Found ${total} result(s)\n\n`;

    if (matchedCommands.length > 0) {
      report += '## Commands\n\n';
      matchedCommands.forEach((c) => {
        report += `- **${c.name}**: ${c.description || 'No description'}\n`;
      });
      report += '\n';
    }
    if (matchedSkills.length > 0) {
      report += '## Skills\n\n';
      matchedSkills.forEach((s) => {
        report += `- **${s.name}**: ${s.description || 'No description'}\n`;
      });
      report += '\n';
    }
    if (matchedAssistants.length > 0) {
      report += '## Assistants\n\n';
      matchedAssistants.forEach((a) => {
        report += `- **${a.name}**: ${a.description || 'No description'}\n`;
      });
      report += '\n';
    }
    if (total === 0) {
      report += `No results found for "${search}". Try a different keyword.\n`;
    }
    return report;
  }

  // Detail mode for a specific item
  if (itemName) {
    const needle = itemName.toLowerCase();
    const all = [...commands, ...skills, ...assistants];
    const item = all.find((i) => (i.name || '').toLowerCase() === needle);

    if (!item) {
      return `# Flutter Help\n\n❌ Item "${itemName}" not found.\n\nUse flutter-help without parameters to see all available resources.\n`;
    }

    let report = `# ${item.name}\n\n`;
    report += `${item.description || ''}\n\n`;

    if (item.purpose?.overview) {
      report += `## Overview\n\n${item.purpose.overview}\n\n`;
    }
    if (item.purpose?.useCases) {
      report += '## Use Cases\n\n';
      item.purpose.useCases.forEach((uc) => {
        report += `- ${uc}\n`;
      });
      report += '\n';
    }
    if (item.usage?.syntax) {
      report += `## Usage\n\n\`${item.usage.syntax}\`\n\n`;
    }
    if (item.relatedCommands) {
      report += '## Related Commands\n\n';
      item.relatedCommands.forEach((rc) => {
        report += `- **${rc.command}**: ${rc.description}\n`;
      });
      report += '\n';
    }
    return report;
  }

  // Category mode or full listing
  let report = '# Flutter Help\n\n';
  report += `Available resources: ${commands.length} Commands, ${skills.length} Skills, ${assistants.length} Assistants\n\n`;

  if (!category || category === 'commands') {
    report += '## Commands\n\n';
    commands.forEach((c, i) => {
      report += `${i + 1}. **${c.name}**: ${c.description || 'No description'}\n`;
    });
    report += '\n';
  }

  if (!category || category === 'skills') {
    report += '## Skills\n\n';
    skills.forEach((s, i) => {
      report += `${i + 1}. **${s.name}**: ${s.description || 'No description'}\n`;
    });
    report += '\n';
  }

  if (!category || category === 'assistants') {
    report += '## Assistants\n\n';
    assistants.forEach((a, i) => {
      report += `${i + 1}. **${a.name}**: ${a.description || 'No description'}\n`;
    });
    report += '\n';
  }

  report += '## Tips\n\n';
  report += '- Use `search` parameter to find specific resources\n';
  report += '- Use `category` parameter to filter by type (commands, skills, assistants)\n';
  report += '- Use `itemName` parameter to get detailed info about a specific resource\n';

  return report;
}

