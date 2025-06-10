import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Basic Chat Participant extension is now active!');

    // Define a simple chat handler
    const handler: vscode.ChatRequestHandler = async (
        request: vscode.ChatRequest,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ) => {
        // Simple greeting and echo functionality
        if (request.prompt.toLowerCase().includes('hello') || request.prompt.toLowerCase().includes('hi')) {
            stream.markdown('👋 Hi! Sarav I\'m your basic learning assistant. How can I help you today?');
            return;
        }

        // Basic help command
        if (request.prompt.toLowerCase().includes('help')) {
            stream.markdown(`
## Available Commands.. check this list
- Say **hello** or **hi** for a greeting
- Ask **help** to see this message
- Ask me anything else and I'll try to respond!

I'm a basic chat participant created for learning purposes.
            `);
            return;
        }

        // Default response - echo with some basic processing
        const userMessage = request.prompt;
        
        stream.markdown(`You said: "${userMessage}"`);
        stream.markdown('\n\n');
        stream.markdown('I\'m a basic chat participant. I can:');
        stream.markdown('\n- Echo your messages');
        stream.markdown('\n- Respond to greetings');
        stream.markdown('\n- Show help information');
        stream.markdown('\n\nThis is a simple example for learning VS Code chat participant development!');
    };

    // Create the chat participant
    const participant = vscode.chat.createChatParticipant('basic-chat-participant.assistant', handler);
    
	
    // Set participant properties
    participant.iconPath = new vscode.ThemeIcon('robot');
    participant.followupProvider = {
        provideFollowups(result: vscode.ChatResult, context: vscode.ChatContext, token: vscode.CancellationToken) {
            return [
                {
                    prompt: 'Tell me more about VS Code extensions',
                    label: '🔍 Learn about extensions',
                },
                {
                    prompt: 'How do chat participants work?',
                    label: '💬 Chat participant info',
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
