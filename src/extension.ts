import * as vscode from 'vscode';
import { availableFunctions, handleFunctionCall } from './functionCallHandler';
import { parseFunctionCallWithLLM } from './llmParser';

export function activate(context: vscode.ExtensionContext) {
    console.log('Basic Chat Participant extension is now active!');

    // Define a simple chat handler
    const handler: vscode.ChatRequestHandler = async (
        request: vscode.ChatRequest,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream, token: vscode.CancellationToken
    ) => {
        // Check for function calls using LLM
        try {
            const functionCall = await parseFunctionCallWithLLM(request.prompt, request.model);

            if (functionCall && functionCall.functionName) {
                const funcInfo = availableFunctions[functionCall.functionName as keyof typeof availableFunctions];

                if (!funcInfo) {
                    stream.markdown(`❌ **Error**: Unknown function '${functionCall.functionName}'`);
                    return;
                }

                // Delegate to the function call handler
                const handled = await handleFunctionCall(
                    functionCall.functionName,
                    functionCall.args,
                    functionCall.type,
                    request.prompt,
                    stream,
                    request.model
                );

                if (handled) {
                    return;
                }
            }
        } catch (error) {
            console.error('LLM function calling error:', error);
        }

        // Simple greeting and echo functionality
        if (request.prompt.toLowerCase().includes('hello') || request.prompt.toLowerCase().includes('hi')) {
            stream.markdown('👋 Hi! Sarav mani I\'m your AI-powered assistant! I can do math calculations, search portfolio data, run scripts, and analyze log files.');
            stream.markdown('\n\n🧠 **Try asking me**:');
            stream.markdown('\n- "Add 5 and 3"');
            stream.markdown('\n- "What is 10 times 4?"');
            stream.markdown('\n- "Search for John\'s projects"');
            stream.markdown('\n- "Find portfolio information about design"');
            stream.markdown('\n- "Run script1 with hello and world"');
            stream.markdown('\n- "Execute calculator script"');
            stream.markdown('\n- "Analyze errors in C:\\\\logs\\\\app.log"');
            stream.markdown('\n- "Check log file for issues"');
            return;
        }

        // Basic help command
        if (request.prompt.toLowerCase().includes('help')) {
            stream.markdown(`
## 🤖 AI-Powered Assistant

I can help you with math calculations, portfolio searches, script execution, and log file analysis using AI and REST APIs!

## 🧮 Math Operations
- **Addition**: "Add 5 and 3", "What's 10 plus 20?"
- **Multiplication**: "Multiply 4 by 6", "What is 8 times 9?"

## 📊 Portfolio Search (REST API + AI)
- **Search Projects**: "Search for design projects", "Find John's work"
- **Portfolio Analysis**: "Show me portfolio data", "What projects are available?"
- **User Information**: "Find user information", "Search for developers"

## ⚡ PowerShell Script Execution
- **Script1 (Greeting)**: "Run script1 with hello and world", "Execute greeting script"
- **Script2 (Calculator)**: "Run calculator with 15 25 multiply", "Execute script2 with numbers"
- **Available Scripts**: script1, script2, greeting, calculator

## 📋 Log File Analysis (AI-Powered)
- **Error Analysis**: "Analyze errors in C:\\\\logs\\\\app.log", "Check log file for issues"
- **Log Reading**: "Read log file ./logs/error.log", "Show me latest errors"
- **Supported Formats**: .log, .txt, .out and other text-based log files
- **AI Solutions**: Automatically provides troubleshooting recommendations

## 🔄 How Portfolio Search Works
1. **REST API Call**: Fetches real data from JSONPlaceholder API
2. **AI Analysis**: Uses LLM to analyze the data
3. **Smart Response**: Provides contextual answers to your queries

## ⚡ How PowerShell Script Execution Works
1. **Script Selection**: Choose from available PowerShell scripts
2. **Parameter Passing**: Optional arguments passed to the script
3. **Execution**: Runs PowerShell with proper security settings
4. **Output Capture**: Returns formatted script output

## 💡 Natural Language Examples
- "Add five and three"
- "Search for projects by user 1"
- "What portfolio information do you have?"
- "Find me some design-related projects"
            `);
            return;
        }

        // Default response - echo with some basic processing
        const userMessage = request.prompt;

        stream.markdown(`You said: "${userMessage}"`);
        stream.markdown('\n\n🤖 I\'m an AI-powered assistant! I can do math calculations and search portfolio data using REST APIs.');
        stream.markdown('\n\n✨ **Try asking me**:');
        stream.markdown('\n- "Add 15 and 25" (Math)');
        stream.markdown('\n- "Search for design projects" (Portfolio API)');
        stream.markdown('\n- "What is 8 times 6?" (Math)');
        stream.markdown('\n- "Find user information" (Portfolio API)');
        stream.markdown('\n- "Run script1 with hello world" (PowerShell)');
        stream.markdown('\n- "Execute calculator script" (PowerShell)');
        stream.markdown('\n- "Analyze errors in C:\\\\logs\\\\app.log" (Log Analysis)');
        stream.markdown('\n- "Check log file for issues" (Log Analysis)');
        stream.markdown('\n\n💡 I use AI to interpret your requests and call the appropriate functions or APIs!');
    };

    // Create the chat participant
    const participant = vscode.chat.createChatParticipant('basic-chat-participant.assistant', handler);

    // Set participant properties
    participant.iconPath = new vscode.ThemeIcon('robot');
    participant.followupProvider = {
        provideFollowups(result: vscode.ChatResult, context: vscode.ChatContext, token: vscode.CancellationToken) {
            return [
                {
                    prompt: 'Add 15 and 27',
                    label: '➕ Add 15 and 27',
                },
                {
                    prompt: 'What is 8 times 12?',
                    label: '✖️ Multiply 8 × 12',
                },
                {
                    prompt: 'Search for design projects',
                    label: '🔍 Search Portfolio',
                },
                {
                    prompt: 'Find user information',
                    label: '👤 Find Users',
                },
                {
                    prompt: 'Run script1 with hello and world',
                    label: '⚡ Run Greeting Script',
                },
                {
                    prompt: 'Execute calculator script with 15 25 multiply',
                    label: '🧮 Run Calculator Script',
                },
                {
                    prompt: 'help',
                    label: '❓ Show help',
                }
            ];
        }
    };
 
    context.subscriptions.push(participant);
}

export function deactivate() {
    console.log('Basic Chat Participant extension is deactivated');
}
