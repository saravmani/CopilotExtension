import * as vscode from 'vscode';
import { handleMathFunction, mathFunctions } from './addons/mathUtils';
import { handleScriptFunction, scriptFunctions } from './addons/scriptUtils';
import { handlePortfolioFunction, portfolioFunctions } from './addons/portfolioUtils';
import { handleLogFunction, logFunctions } from './addons/logUtils';

/**
 * Main function call dispatcher and registry
 */

/**
 * Combined functions registry from all addon modules
 */
export const availableFunctions = {
    ...mathFunctions,
    ...scriptFunctions,
    ...portfolioFunctions,
    ...logFunctions
};

/**
 * Main function call dispatcher that routes to appropriate addon handlers
 * @param functionName - Name of the function to execute
 * @param args - Arguments for the function
 * @param type - Type of function (math, script, api)
 * @param prompt - Original user prompt
 * @param stream - VS Code chat response stream
 * @param model - VS Code language model for AI processing
 * @returns Promise<boolean> - True if function was handled successfully
 */
export async function handleFunctionCall(
    functionName: string,
    args: any[],
    type: string,
    prompt: string,
    stream: vscode.ChatResponseStream,
    model: vscode.LanguageModelChat
): Promise<boolean> {    try {
        switch (type) {
            case 'math':
                await handleMathFunction(functionName, args, prompt, stream);
                return true;

            case 'api':
                if (functionName === 'SearchPortfolio') {
                    await handlePortfolioFunction(functionName, args, prompt, stream, model);
                    return true;
                }
                break;

            case 'script':
                if (functionName === 'ExecuteScript') {
                    await handleScriptFunction(functionName, args, prompt, stream);
                    return true;
                }
                break;            case 'log':
                if (functionName === 'AnalyzeLogErrors' || functionName === 'ReadLogFile' || functionName === 'ListLogConfigurations') {
                    await handleLogFunction(functionName, args, prompt, stream, model);
                    return true;
                }
                break;

            default:
                stream.markdown(`❌ **Error**: Unknown function type '${type}'`);
                return false;
        }

        stream.markdown(`❌ **Error**: Unsupported function '${functionName}' of type '${type}'`);
        return false;
    } catch (error) {
        console.error(`Error handling function ${functionName}:`, error);
        stream.markdown(`❌ **Error**: Failed to execute ${functionName} - ${error}`);
        return false;
    }
}