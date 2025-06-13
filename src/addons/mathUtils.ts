import * as vscode from 'vscode';

/**
 * Math utilities and handlers for the chat participant extension
 */

/**
 * Adds two numbers together
 * @param a - First number
 * @param b - Second number
 * @returns The sum of a and b
 */
export function AddTwoNumbers(a: number, b: number): number {
    return a + b;
}

/**
 * Multiplies two numbers together
 * @param a - First number
 * @param b - Second number
 * @returns The product of a and b
 */
export function MultiplyNumbers(a: number, b: number): number {
    return a * b;
}

/**
 * Formats a math operation result with rich markdown
 * @param operation - The operation performed (e.g., "addition", "multiplication")
 * @param a - First operand
 * @param b - Second operand
 * @param result - The calculation result
 * @returns Formatted markdown string
 */
export function formatMathResult(operation: string, a: number, b: number, result: number): string {
    const operationSymbol = operation === 'addition' ? '+' : '×';
    return `✅ **Math Calculation Complete!**\n\n**Operation:** ${operation}\n**Calculation:** ${a} ${operationSymbol} ${b} = **${result}**`;
}

/**
 * Handles math function calls with validation and stream output
 * @param functionName - Name of the math function to execute
 * @param args - Arguments for the function
 * @param prompt - Original user prompt
 * @param stream - VS Code chat response stream
 */
export async function handleMathFunction(
    functionName: string,
    args: any[],
    prompt: string,
    stream: vscode.ChatResponseStream
): Promise<void> {
    // Validate arguments
    if (args.length !== 2) {
        stream.markdown(`❌ **Error**: ${functionName} requires exactly 2 parameters`);
        return;
    }

    // Execute the math function
    let result: number;
    switch (functionName) {
        case 'AddTwoNumbers':
            result = AddTwoNumbers(args[0], args[1]);
            break;
        case 'MultiplyNumbers':
            result = MultiplyNumbers(args[0], args[1]);
            break;
        default:
            stream.markdown(`❌ **Error**: Unsupported math function '${functionName}'`);
            return;
    }

    // Display the math result with formatted output
    stream.markdown(`🤖 **AI Interpreted**: "${prompt}"`);
    stream.markdown(`\n\n🔧 **Function Call**: \`${functionName}(${args.join(', ')})\``);
    
    const operation = functionName === 'AddTwoNumbers' ? 'addition' : 'multiplication';
    const formattedResult = formatMathResult(operation, args[0], args[1], result);
    stream.markdown(`\n\n${formattedResult}`);
}

/**
 * Math functions registry for the extension
 */
export const mathFunctions = {
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
    }
};
