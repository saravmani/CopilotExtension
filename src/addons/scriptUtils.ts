import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Executes PowerShell scripts with optional parameters
 * @param scriptCode - The script name/code to execute
 * @param args - Optional arguments to pass to the script
 * @returns Promise<string> - The formatted execution result
 */
export async function ExecuteScript(scriptCode: string, args: string[] = []): Promise<string> {
    try {
        console.log(`Executing PowerShell script: ${scriptCode} with args:`, args);
        
        // Get the extension's directory
        const extensionPath = vscode.extensions.getExtension('your-publisher.basic-chat-participant')?.extensionPath 
                            || path.join(__dirname, '..');
        
        // Define available scripts
        const availableScripts: { [key: string]: string } = {
            'script1': path.join(extensionPath, 'scripts', 'script1.ps1'),
            'script2': path.join(extensionPath, 'scripts', 'script2.ps1'),
            'greeting': path.join(extensionPath, 'scripts', 'script1.ps1'),
            'calculator': path.join(extensionPath, 'scripts', 'script2.ps1')
        };

        // Get the script path
        const scriptPath = availableScripts[scriptCode.toLowerCase()];
        if (!scriptPath) {
            return `❌ Script '${scriptCode}' not found. Available scripts: ${Object.keys(availableScripts).join(', ')}`;
        }

        // Build PowerShell command with arguments
        let psCommand = `powershell.exe -ExecutionPolicy Bypass -File "${scriptPath}"`;
        
        // Add arguments if provided
        if (args && args.length > 0) {
            const psArgs = args.map(arg => `"${arg}"`).join(' ');
            psCommand += ` ${psArgs}`;
        }

        console.log(`Executing command: ${psCommand}`);

        // Execute the PowerShell script
        const { stdout, stderr } = await execAsync(psCommand, {
            timeout: 30000, // 30 second timeout
            cwd: extensionPath
        });

        if (stderr) {
            console.error('PowerShell stderr:', stderr);
            return `⚠️ Script executed with warnings:\n\n**Output:**\n\`\`\`\n${stdout}\n\`\`\`\n\n**Warnings:**\n\`\`\`\n${stderr}\n\`\`\``;
        }

        return `✅ **PowerShell Script Executed Successfully!**\n\n**Script:** ${scriptCode}\n**Arguments:** ${args.join(', ') || 'None'}\n\n**Output:**\n\`\`\`\n${stdout}\n\`\`\``;

    } catch (error) {
        console.error('Error executing PowerShell script:', error);
        return `❌ **Error executing PowerShell script:**\n\n\`\`\`\n${error}\n\`\`\`\n\n**Tip:** Make sure PowerShell is available and the script exists.`;
    }
}

/**
 * Handles script execution function calls with validation and stream output
 * @param functionName - Name of the script function to execute
 * @param args - Arguments for the function
 * @param prompt - Original user prompt
 * @param stream - VS Code chat response stream
 */
export async function handleScriptFunction(
    functionName: string,
    args: any[],
    prompt: string,
    stream: vscode.ChatResponseStream
): Promise<void> {
    // Validate arguments
    if (args.length < 1) {
        stream.markdown(`❌ **Error**: ${functionName} requires at least 1 parameter (script name)`);
        stream.markdown(`\n\n**Available scripts**: script1, script2, greeting, calculator`);
        stream.markdown(`\n\n**Examples**:`);
        stream.markdown(`\n- "Run script1 with hello and world"`);
        stream.markdown(`\n- "Execute calculator script with 15 25 multiply"`);
        return;
    }

    const scriptCode = args[0];
    const scriptArgs = args[1] || [];

    stream.markdown(`⚡ **Executing PowerShell Script**: "${scriptCode}"`);
    if (scriptArgs.length > 0) {
        stream.markdown(`\n📝 **Arguments**: ${Array.isArray(scriptArgs) ? scriptArgs.join(', ') : scriptArgs}`);
    }
    stream.markdown('\n\n⏳ *Running PowerShell script...*');

    try {
        const result = await ExecuteScript(scriptCode, Array.isArray(scriptArgs) ? scriptArgs : [scriptArgs]);

        // Display script execution results
        stream.markdown(`\n\n${result}`);
    } catch (error) {
        stream.markdown(`\n\n❌ **Error**: Script execution failed - ${error}`);
    }
}

/**
 * Script functions registry for the extension
 */
export const scriptFunctions = {
    ExecuteScript: {
        func: ExecuteScript,
        description: "Executes PowerShell scripts with optional parameters",
        parameters: ["scriptCode", "args"],
        example: "Run script1 with greeting parameters",
        type: "script"
    }
};
