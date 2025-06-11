import * as vscode from 'vscode';

// Function implementations
function AddTwoNumbers(a: number, b: number): number {
    console.log(`Adding ${a} + ${b}`);
    return a + b;
}

function MultiplyNumbers(a: number, b: number): number {
    console.log(`Multiplying ${a} * ${b}`);
    return a * b;
}

// Portfolio search function using REST API
async function SearchPortfolio(query: string, model: vscode.LanguageModelChat): Promise<string> {
    try {
        console.log(`Searching portfolio for: ${query}`);

        // Call free JSONPlaceholder API to simulate portfolio data
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const userData = await response.json() as any[];

        // Also get posts to simulate portfolio projects
        const postsResponse = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10');
        const postsData = await postsResponse.json() as any[];

        // Combine data to simulate a portfolio
        const portfolioData = {
            users: userData.slice(0, 3), // Limit to 3 users for demo
            projects: postsData.map((post: any) => ({
                id: post.id,
                title: post.title,
                description: post.body,
                userId: post.userId
            }))
        };

        // Use LLM to analyze the data and respond to user query
        const analysisPrompt = `You are a portfolio analyst. I have the following portfolio data and a user query. 
Please analyze the data and provide a helpful response to the user's question.

Portfolio Data:
${JSON.stringify(portfolioData, null, 2)}

User Query: "${query}"

Please provide a helpful, conversational response about the portfolio data that addresses the user's query. 
If the query doesn't match the available data, explain what information is available instead.
Keep the response concise but informative.`;

        const messages = [vscode.LanguageModelChatMessage.User(analysisPrompt)];
        const llmResponse = await model.sendRequest(messages, {
            justification: 'Analyze portfolio data and respond to user queries about investments and projects'
        });

        let fullAnalysis = '';
        for await (const fragment of llmResponse.text) {
            fullAnalysis += fragment;
        }

        return fullAnalysis;
    } catch (error) {
        console.error('Error in SearchPortfolio:', error);
        return `❌ Error searching portfolio: ${error}`;
    }
}

// Available functions registry
const availableFunctions = {
    AddTwoNumbers: {
        func: AddTwoNumbers,
        description: "Adds two numbers together",
        parameters: ["number1", "number2"],
        example: "Add 5 and 3",
        type: "math"
    },
    MultiplyNumbers: {
        func: MultiplyNumbers,
        description: "Multiplies two numbers",
        parameters: ["number1", "number2"],
        example: "Multiply 4 by 7",
        type: "math"
    },
    SearchPortfolio: {
        func: SearchPortfolio,
        description: "Searches and analyzes portfolio data using REST API and AI",
        parameters: ["query"],
        example: "Search for projects by John",
        type: "api"
    }
};

// Function to use LLM to parse function calls from natural language
async function parseFunctionCallWithLLM(input: string, model: vscode.LanguageModelChat): Promise<{ functionName: string, args: any[], type: string } | null> {
    const systemPrompt = `You are a function call parser. Given a user input, determine if they want to call a function and extract the parameters.

Available functions:
- AddTwoNumbers(a, b): Adds two numbers
- MultiplyNumbers(a, b): Multiplies two numbers  
- SearchPortfolio(query): Searches portfolio data using REST API and AI analysis

Respond ONLY with a JSON object in this exact format:
{"functionName": "FunctionName", "args": [param1, param2], "type": "math|api"}

If no function should be called, respond with: {"functionName": null, "args": [], "type": "none"}

Examples:
- "Add 5 and 3" → {"functionName": "AddTwoNumbers", "args": [5, 3], "type": "math"}
- "What is 10 times 4?" → {"functionName": "MultiplyNumbers", "args": [10, 4], "type": "math"}
- "Search for John's projects" → {"functionName": "SearchPortfolio", "args": ["John's projects"], "type": "api"}
- "Find portfolio information about design" → {"functionName": "SearchPortfolio", "args": ["design"], "type": "api"}
- "Hello there" → {"functionName": null, "args": [], "type": "none"}

User input: "${input}"`;

    try {
        const messages = [vscode.LanguageModelChatMessage.User(systemPrompt)];
        const response = await model.sendRequest(messages, {
            justification: 'Parse user input to determine function calls for mathematical operations and portfolio searches'
        });

        let fullResponse = '';
        for await (const fragment of response.text) {
            fullResponse += fragment;
        }

        // Parse the JSON response
        const parsed = JSON.parse(fullResponse.trim());

        if (parsed.functionName === null || !parsed.functionName) {
            return null;
        }

        return {
            functionName: parsed.functionName,
            args: parsed.args || [],
            type: parsed.type || 'unknown'
        };
    } catch (error) {
        console.error('Error parsing function call with LLM:', error);
        return null;
    }
}

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

                // Handle different function types
                let result: any;

                if (functionCall.type === 'api' && functionCall.functionName === 'SearchPortfolio') {
                    if (functionCall.args.length !== 1) {
                        stream.markdown(`❌ **Error**: ${functionCall.functionName} requires exactly 1 parameter (search query)`);
                        return;
                    }

                    stream.markdown(`🔍 **Searching Portfolio**: "${functionCall.args[0]}"`);
                    stream.markdown('\n\n⏳ *Calling REST API and analyzing with AI...*');

                    result = await SearchPortfolio(functionCall.args[0], request.model);

                    // Display portfolio search results
                    stream.markdown(`\n\n🤖 **AI Analysis**:`);
                    stream.markdown(`\n\n${result}`);
                    return;

                } else if (functionCall.type === 'math') {
                    if (functionCall.args.length !== 2) {
                        stream.markdown(`❌ **Error**: ${functionCall.functionName} requires exactly 2 parameters`);
                        return;
                    }

                    // Execute the math function
                    switch (functionCall.functionName) {
                        case 'AddTwoNumbers':
                            result = AddTwoNumbers(functionCall.args[0], functionCall.args[1]);
                            break;
                        case 'MultiplyNumbers':
                            result = MultiplyNumbers(functionCall.args[0], functionCall.args[1]);
                            break;
                        default:
                            stream.markdown(`❌ **Error**: Unsupported math function '${functionCall.functionName}'`);
                            return;
                    }

                    // Display the math result
                    stream.markdown(`🤖 **AI Interpreted**: "${request.prompt}"`);
                    stream.markdown(`\n\n🔧 **Function Call**: \`${functionCall.functionName}(${functionCall.args.join(', ')})\``);
                    stream.markdown(`\n\n✅ **Result**: \`${result}\``);

                    // Add operation-specific formatting
                    let operation = '';
                    switch (functionCall.functionName) {
                        case 'AddTwoNumbers':
                            operation = `${functionCall.args[0]} + ${functionCall.args[1]} = ${result}`;
                            break;
                        case 'MultiplyNumbers':
                            operation = `${functionCall.args[0]} × ${functionCall.args[1]} = ${result}`;
                            break;
                    }
                    stream.markdown(`\n\n🧮 **Calculation**: ${operation}`);
                    return;
                }
            }
        } catch (error) {
            console.error('LLM function calling error:', error);
        }

        // Simple greeting and echo functionality
        if (request.prompt.toLowerCase().includes('hello') || request.prompt.toLowerCase().includes('hi')) {
            stream.markdown('👋 Hi! Sarav mani I\'m your AI-powered assistant! I can do math calculations and search portfolio data.');
            stream.markdown('\n\n🧠 **Try asking me**:');
            stream.markdown('\n- "Add 5 and 3"');
            stream.markdown('\n- "What is 10 times 4?"');
            stream.markdown('\n- "Search for John\'s projects"');
            stream.markdown('\n- "Find portfolio information about design"');
            return;
        }

        // Basic help command
        if (request.prompt.toLowerCase().includes('help')) {
            stream.markdown(`
## 🤖 AI-Powered Assistant

I can help you with math calculations and portfolio searches using AI and REST APIs!

## 🧮 Math Operations
- **Addition**: "Add 5 and 3", "What's 10 plus 20?"
- **Multiplication**: "Multiply 4 by 6", "What is 8 times 9?"

## 📊 Portfolio Search (REST API + AI)
- **Search Projects**: "Search for design projects", "Find John's work"
- **Portfolio Analysis**: "Show me portfolio data", "What projects are available?"
- **User Information**: "Find user information", "Search for developers"

## 🔄 How Portfolio Search Works
1. **REST API Call**: Fetches real data from JSONPlaceholder API
2. **AI Analysis**: Uses LLM to analyze the data
3. **Smart Response**: Provides contextual answers to your queries

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
