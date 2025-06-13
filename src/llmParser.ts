import * as vscode from 'vscode';

/**
 * LLM-based function call parser
 */

/**
 * Uses LLM to parse natural language input and determine function calls
 * @param input - User's natural language input
 * @param model - VS Code language model for AI processing
 * @returns Promise with parsed function call information or null
 */
export async function parseFunctionCallWithLLM(
    input: string, 
    model: vscode.LanguageModelChat
): Promise<{ functionName: string, args: any[], type: string } | null> {
    const systemPrompt = `You are a function call parser. Given a user input, determine if they want to call a function and extract the parameters.

Available functions:
- AddTwoNumbers(a, b): Adds two numbers
- MultiplyNumbers(a, b): Multiplies two numbers  
- SearchPortfolio(query): Searches portfolio data using REST API and AI analysis
- ExecuteScript(scriptCode, args): Executes PowerShell scripts with parameters

Respond ONLY with a JSON object in this exact format:
{"functionName": "FunctionName", "args": [param1, param2], "type": "math|api|script"}

If no function should be called, respond with: {"functionName": null, "args": [], "type": "none"}

Examples:
- "Add 5 and 3" → {"functionName": "AddTwoNumbers", "args": [5, 3], "type": "math"}
- "What is 10 times 4?" → {"functionName": "MultiplyNumbers", "args": [10, 4], "type": "math"}
- "Search for John's projects" → {"functionName": "SearchPortfolio", "args": ["John's projects"], "type": "api"}
- "Run script1 with hello and world" → {"functionName": "ExecuteScript", "args": ["script1", ["hello", "world"]], "type": "script"}
- "Execute calculator script with 15 and 25" → {"functionName": "ExecuteScript", "args": ["calculator", ["15", "25", "add"]], "type": "script"}
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