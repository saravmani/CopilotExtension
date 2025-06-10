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

function SubtractNumbers(a: number, b: number): number {
    console.log(`Subtracting ${a} - ${b}`);
    return a - b;
}

// Available functions registry
const availableFunctions = {
    AddTwoNumbers: {
        func: AddTwoNumbers,
        description: "Adds two numbers together",
        parameters: ["number1", "number2"],
        example: "Add 5 and 3"
    },
    MultiplyNumbers: {
        func: MultiplyNumbers,
        description: "Multiplies two numbers",
        parameters: ["number1", "number2"],
        example: "Multiply 4 by 7"
    },
    SubtractNumbers: {
        func: SubtractNumbers,
        description: "Subtracts second number from first number",
        parameters: ["number1", "number2"],
        example: "Subtract 3 from 10"
    }
};

// Function to use LLM to parse function calls from natural language
async function parseFunctionCallWithLLM(input: string, model: vscode.LanguageModelChat): Promise<{ functionName: string, args: number[] } | null> {
    const systemPrompt = `You are a function call parser. Given a user input, determine if they want to call a mathematical function and extract the parameters.

Available functions:
- AddTwoNumbers(a, b): Adds two numbers
- MultiplyNumbers(a, b): Multiplies two numbers  
- SubtractNumbers(a, b): Subtracts b from a

Respond ONLY with a JSON object in this exact format:
{"functionName": "FunctionName", "args": [number1, number2]}

If no function should be called, respond with: {"functionName": null, "args": []}

Examples:
- "Add 5 and 3" → {"functionName": "AddTwoNumbers", "args": [5, 3]}
- "What is 10 times 4?" → {"functionName": "MultiplyNumbers", "args": [10, 4]}
- "Subtract 7 from 15" → {"functionName": "SubtractNumbers", "args": [15, 7]}
- "Hello there" → {"functionName": null, "args": []}

User input: "${input}"`;

    try {
        const messages = [vscode.LanguageModelChatMessage.User(systemPrompt)];
        const response = await model.sendRequest(messages, {
            justification: 'Parse user input to determine function calls for mathematical operations'
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
            args: parsed.args || []
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
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
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

                if (functionCall.args.length !== 2) {
                    stream.markdown(`❌ **Error**: ${functionCall.functionName} requires exactly 2 parameters`);
                    stream.markdown(`\n\n**Example**: ${funcInfo.example}`);
                    return;
                }

                // Execute the function
                const result = funcInfo.func(functionCall.args[0], functionCall.args[1]);
                
                // Display the result
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
                    case 'SubtractNumbers':
                        operation = `${functionCall.args[0]} - ${functionCall.args[1]} = ${result}`;
                        break;
                }
                stream.markdown(`\n\n🧮 **Calculation**: ${operation}`);
                return;
            }
        } catch (error) {
            console.error('LLM function calling error:', error);
            // Continue to regular chat handling if LLM fails
        }

        // Simple greeting and echo functionality
        if (request.prompt.toLowerCase().includes('hello') || request.prompt.toLowerCase().includes('hi')) {
            stream.markdown('👋 Hi! Sarav mani I\'m your AI-powered math assistant! I can understand natural language and perform calculations.');
            stream.markdown('\n\n🧠 **Try asking me**:');
            stream.markdown('\n- "Add 5 and 3"');
            stream.markdown('\n- "What is 10 times 4?"');
            stream.markdown('\n- "Subtract 7 from 15"');
            return;
        }

        // Basic help command
        if (request.prompt.toLowerCase().includes('help')) {
            stream.markdown(`
## 🤖 AI-Powered Math Assistant

I use AI to understand your natural language requests and perform mathematical operations!

## 🧮 Available Operations
- **Addition**: "Add 5 and 3", "What's 10 plus 20?", "5 + 7"
- **Multiplication**: "Multiply 4 by 6", "What is 8 times 9?", "3 × 12"  
- **Subtraction**: "Subtract 5 from 10", "What's 20 minus 8?", "15 - 7"

## 💡 Natural Language Examples
- "Add five and three"
- "What is ten times four?"
- "Subtract seven from fifteen"
- "Calculate 25 plus 13"
- "What's 100 divided by... wait, I don't do division yet! 😅"

## 🎯 How It Works
1. You ask in natural language
2. AI interprets your request  
3. I execute the math function
4. You get the result!
            `);
            return;
        }

        // Default response - echo with some basic processing
        const userMessage = request.prompt;
        
        stream.markdown(`You said: "${userMessage}"`);
        stream.markdown('\n\n🤖 I\'m an AI-powered math assistant! I can understand natural language and perform calculations.');
        stream.markdown('\n\n✨ **Try asking me**:');
        stream.markdown('\n- "Add 15 and 25"');
        stream.markdown('\n- "What is 8 times 6?"');
        stream.markdown('\n- "Subtract 12 from 30"');
        stream.markdown('\n\n💡 I use AI to interpret your requests and call the appropriate math functions!');
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
                    prompt: 'Subtract 18 from 50',
                    label: '➖ Subtract 18 from 50',
                },
                {
                    prompt: 'help',
                    label: '❓ Show help',
                }
            ];
        }
    };

    // Add the participant to the extension context
    context.subscriptions.push(participant);
}

export function deactivate() {
    console.log('Basic Chat Participant extension is deactivated');
}
