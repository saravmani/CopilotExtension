import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Log analysis utilities and handlers for the chat participant extension
 */

/**
 * Interface for log configuration from user settings
 */
interface LogConfig {
    environment: string;
    component: string;
    path: string;
    description?: string;
}

/**
 * Gets log configurations from user settings
 * @returns LogConfig[] - Array of log configurations
 */
export function getLogConfigurations(): LogConfig[] {
    const config = vscode.workspace.getConfiguration('basicChatParticipant');
    const logConfigs = config.get<LogConfig[]>('logFiles') || [];
    
    console.log('Retrieved log configurations:', logConfigs);
    return logConfigs;
}

/**
 * Finds log file path by environment and component
 * @param environment - Environment name (e.g., "production", "staging", "dev")
 * @param component - Component name (e.g., "api", "frontend", "database")
 * @returns string | null - Log file path or null if not found
 */
export function findLogPath(environment: string, component: string): string | null {
    const logConfigs = getLogConfigurations();
    const match = logConfigs.find(config => 
        config.environment.toLowerCase() === environment.toLowerCase() &&
        config.component.toLowerCase() === component.toLowerCase()
    );
    
    return match ? match.path : null;
}

/**
 * Lists all available log configurations
 * @returns string - Formatted list of available log configurations
 */
export function listLogConfigurations(): string {
    const logConfigs = getLogConfigurations();
    
    if (logConfigs.length === 0) {
        return `📋 **No Log Configurations Found**\n\n⚙️ **Setup Required**: Please configure log files in VS Code settings.\n\n**Steps to configure:**\n1. Open VS Code Settings (Ctrl+,)\n2. Search for "Basic Chat Participant"\n3. Add log file configurations with environment, component, and path\n\n**Example configuration:**\n\`\`\`json\n[\n  {\n    "environment": "production",\n    "component": "api",\n    "path": "C:\\\\logs\\\\prod-api.log",\n    "description": "Production API logs"\n  },\n  {\n    "environment": "dev",\n    "component": "frontend",\n    "path": "./logs/dev-frontend.log",\n    "description": "Development frontend logs"\n  }\n]\n\`\`\``;
    }

    return `📋 **Available Log Configurations** (${logConfigs.length} total)\n\n${logConfigs.map((config, index) => 
        `**${index + 1}. ${config.environment} - ${config.component}**\n` +
        `   📁 Path: \`${config.path}\`\n` +
        `   📝 Description: ${config.description || 'No description'}\n`
    ).join('\n')}\n\n💡 **Usage Examples:**\n- "Analyze logs from production api"\n- "Check dev frontend errors"\n- "Read staging database logs"`;
}

/**
 * Reads and analyzes log files for errors, exceptions, and failures
 * @param logPath - Path to the log file
 * @param maxEntries - Maximum number of error entries to return (default: 4)
 * @returns Promise<string[]> - Array of error log entries
 */
export async function ReadLogFile(logPath: string, maxEntries: number = 4): Promise<string[]> {
    try {
        console.log(`Reading log file: ${logPath}`);
        
        // Check if file exists
        if (!fs.existsSync(logPath)) {
            throw new Error(`Log file not found: ${logPath}`);
        }

        // Read the file content
        const fileContent = fs.readFileSync(logPath, 'utf8');
        const lines = fileContent.split('\n');

        // Define error keywords to search for
        const errorKeywords = [
            'exception', 'error', 'fail', 'failed', 'failure', 
            'critical', 'fatal', 'panic', 'crash', 'abort',
            'warning', 'warn', 'severe', 'alert'
        ];

        // Find lines containing error keywords
        const errorLines: { line: string, lineNumber: number, timestamp?: string }[] = [];
        
        lines.forEach((line, index) => {
            const lowerLine = line.toLowerCase();
            const hasErrorKeyword = errorKeywords.some(keyword => lowerLine.includes(keyword));
            
            if (hasErrorKeyword && line.trim().length > 0) {
                // Try to extract timestamp from the line
                const timestampMatch = line.match(/(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})[\s\T](\d{2}:\d{2}:\d{2})/);
                
                errorLines.push({
                    line: line.trim(),
                    lineNumber: index + 1,
                    timestamp: timestampMatch ? timestampMatch[0] : undefined
                });
            }
        });

        // Sort by line number (latest entries are typically at the end)
        errorLines.sort((a, b) => b.lineNumber - a.lineNumber);

        // Return the latest entries (up to maxEntries)
        return errorLines.slice(0, maxEntries).map(entry => 
            `[Line ${entry.lineNumber}${entry.timestamp ? `, ${entry.timestamp}` : ''}] ${entry.line}`
        );

    } catch (error) {
        console.error('Error reading log file:', error);
        throw error;
    }
}

/**
 * Analyzes log errors using LLM and provides solutions
 * @param logIdentifier - Either a direct file path or "environment component" format
 * @param model - VS Code language model for AI analysis
 * @param maxEntries - Maximum number of error entries to analyze
 * @returns Promise<string> - LLM analysis and solutions
 */
export async function AnalyzeLogErrors(logIdentifier: string, model: vscode.LanguageModelChat, maxEntries: number = 4): Promise<string> {
    try {
        console.log(`Analyzing log errors from: ${logIdentifier}`);
        
        let logPath: string;
        let environmentInfo = '';

        // Check if logIdentifier is a direct path or environment/component format
        if (fs.existsSync(logIdentifier)) {
            // Direct file path
            logPath = logIdentifier;
        } else {
            // Try to parse as "environment component" format
            const parts = logIdentifier.trim().split(/\s+/);
            if (parts.length >= 2) {
                const environment = parts[0];
                const component = parts.slice(1).join(' ');
                const foundPath = findLogPath(environment, component);
                
                if (foundPath) {
                    logPath = foundPath;
                    environmentInfo = ` (${environment} - ${component})`;
                } else {
                    return `❌ **Log Configuration Not Found**\n\n**Searched for**: ${environment} - ${component}\n\n${listLogConfigurations()}`;
                }
            } else {
                return `❌ **Invalid Log Identifier**\n\n**Format**: Use either:\n- Direct path: "C:\\\\logs\\\\app.log"\n- Environment/Component: "production api" or "dev frontend"\n\n${listLogConfigurations()}`;
            }
        }
        
        // Read error entries from log file
        const errorEntries = await ReadLogFile(logPath, maxEntries);
        
        if (errorEntries.length === 0) {
            return `📋 **Log Analysis Complete**\n\n✅ **Good News!** No errors, exceptions, or failures found in the log file.\n\n**File:** ${logPath}${environmentInfo}\n\n*The log appears to be clean or contains only informational messages.*`;
        }

        // Prepare analysis prompt for LLM
        const analysisPrompt = `You are a log analysis expert. I have extracted the latest error entries from a log file. Please analyze these errors and provide:

1. A summary of the main issues found
2. Potential root causes for each error
3. Recommended solutions or troubleshooting steps
4. Priority level (Critical, High, Medium, Low) for each issue

Log file: ${logPath}${environmentInfo}
Error entries found (${errorEntries.length} total):

${errorEntries.map((entry, index) => `${index + 1}. ${entry}`).join('\n')}

Please provide a clear, actionable analysis with specific recommendations for resolving these issues. Format your response in markdown with clear sections and bullet points.`;

        const messages = [vscode.LanguageModelChatMessage.User(analysisPrompt)];
        const llmResponse = await model.sendRequest(messages, {
            justification: 'Analyze log file errors and provide troubleshooting solutions'
        });

        let fullAnalysis = '';
        for await (const fragment of llmResponse.text) {
            fullAnalysis += fragment;
        }

        return `📊 **Log File Analysis**\n\n**File:** ${logPath}${environmentInfo}\n**Errors Found:** ${errorEntries.length}\n\n---\n\n${fullAnalysis}`;

    } catch (error) {
        console.error('Error analyzing log file:', error);
        return `❌ **Log Analysis Failed**\n\n**Error:** ${error}\n\n**Identifier:** ${logIdentifier}\n\n*Please check if the file exists and is readable, or verify your log configuration.*`;
    }
}

/**
 * Handles log analysis function calls with validation and stream output
 * @param functionName - Name of the log function to execute
 * @param args - Arguments for the function
 * @param prompt - Original user prompt
 * @param stream - VS Code chat response stream
 * @param model - VS Code language model for AI analysis
 */
export async function handleLogFunction(
    functionName: string,
    args: any[],
    prompt: string,
    stream: vscode.ChatResponseStream,
    model: vscode.LanguageModelChat
): Promise<void> {
    // Handle list configurations request
    if (functionName === 'ListLogConfigurations') {
        const configList = listLogConfigurations();
        stream.markdown(`\n\n${configList}`);
        return;
    }

    // Validate arguments for other functions
    if (args.length < 1) {
        stream.markdown(`❌ **Error**: ${functionName} requires at least 1 parameter`);
        stream.markdown(`\n\n**Examples**:`);
        stream.markdown(`\n- "Analyze logs from production api" (using configured logs)`);
        stream.markdown(`\n- "Check dev frontend errors" (using configured logs)`);
        stream.markdown(`\n- "Analyze logs from C:\\logs\\app.log" (direct path)`);
        stream.markdown(`\n- "List log configurations" (show available logs)`);
        stream.markdown(`\n\n**Configuration**: Set up log files in VS Code settings under "Basic Chat Participant > Log Files"`);
        return;
    }

    const logIdentifier = args[0];
    const maxEntries = args[1] || 4;

    stream.markdown(`📂 **Processing Log Request**: "${logIdentifier}"`);
    stream.markdown(`\n📋 **Max Error Entries**: ${maxEntries}`);
    stream.markdown('\n\n⏳ *Reading log file and analyzing errors with AI...*');

    try {
        let result: string;
        
        if (functionName === 'AnalyzeLogErrors') {
            result = await AnalyzeLogErrors(logIdentifier, model, maxEntries);
        } else if (functionName === 'ReadLogFile') {
            // For ReadLogFile, we need to resolve the path first
            let logPath: string;
            
            if (fs.existsSync(logIdentifier)) {
                logPath = logIdentifier;
            } else {
                const parts = logIdentifier.trim().split(/\s+/);
                if (parts.length >= 2) {
                    const environment = parts[0];
                    const component = parts.slice(1).join(' ');
                    const foundPath = findLogPath(environment, component);
                    
                    if (foundPath) {
                        logPath = foundPath;
                    } else {
                        stream.markdown(`\n\n❌ **Log Configuration Not Found**: ${environment} - ${component}`);
                        stream.markdown(`\n\n${listLogConfigurations()}`);
                        return;
                    }
                } else {
                    stream.markdown(`\n\n❌ **Invalid Log Identifier Format**`);
                    return;
                }
            }
            
            const errorEntries = await ReadLogFile(logPath, maxEntries);
            result = `📋 **Log File Read Complete**\n\n**File:** ${logPath}\n**Error Entries Found:** ${errorEntries.length}\n\n**Latest Error Entries:**\n\n${errorEntries.map((entry, index) => `${index + 1}. ${entry}`).join('\n\n')}`;
        } else {
            stream.markdown(`\n\n❌ **Error**: Unsupported log function '${functionName}'`);
            return;
        }

        // Display log analysis results
        stream.markdown(`\n\n${result}`);
    } catch (error) {
        stream.markdown(`\n\n❌ **Error**: Log analysis failed - ${error}`);
    }
}

/**
 * Log functions registry for the extension
 */
export const logFunctions = {
    AnalyzeLogErrors: {
        func: AnalyzeLogErrors,
        description: "Analyzes log files for errors and provides AI-powered solutions",
        parameters: ["logIdentifier", "maxEntries?"],
        example: "Analyze logs from production api",
        type: "log"
    },
    ReadLogFile: {
        func: ReadLogFile,
        description: "Reads log files and extracts error entries",
        parameters: ["logIdentifier", "maxEntries?"],
        example: "Read log file dev frontend",
        type: "log"
    },
    ListLogConfigurations: {
        func: listLogConfigurations,
        description: "Lists all configured log files with environment and component information",
        parameters: [],
        example: "List log configurations",
        type: "log"
    }
};
