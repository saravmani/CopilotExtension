# How to Test Your VS Code Chat Participant Extension

Your basic chat participant extension is ready! Here's how to test it:

## 🚀 Quick Start - Testing Your Extension

### Step 1: Launch Extension Development Host
1. **Press F5** in VS Code (or go to Run and Debug panel)
2. This will open a new VS Code window with your extension loaded
3. Look for "Extension Development Host" in the window title

### Step 2: Open Chat Panel
In the new window, open the chat panel using one of these methods:
- **Keyboard shortcut**: `Ctrl+Alt+I` (Windows/Linux) or `Cmd+Alt+I` (Mac)
- **Command Palette**: `Ctrl+Shift+P` → "Chat: Focus on Chat View"
- **View Menu**: Go to `View > Chat`

### Step 3: Use Your Chat Participant
1. In the chat input box, type `@assistant` 
2. Your chat participant should appear in the suggestions
3. Try these test commands:

```
@assistant hello
@assistant help  
@assistant Tell me about VS Code extensions
@assistant How do chat participants work?
```

## 🧪 What to Expect

### Greeting Response
When you type: `@assistant hello`
You should see: "👋 Hello! I'm your basic learning assistant. How can I help you today?"

### Help Response  
When you type: `@assistant help`
You should see a formatted help message with available commands.

### Echo Response
For any other message, it will echo your input and explain its capabilities.

### Follow-up Suggestions
After each response, you'll see suggested follow-up questions like:
- 🔍 Learn about extensions
- 💬 Chat participant info  
- ❓ Show help

## 🔧 Troubleshooting

### Chat Participant Not Showing Up?
1. Check the **Debug Console** for error messages
2. Make sure the extension compiled successfully: `npm run compile`
3. Verify GitHub Copilot Chat extension is installed
4. Try restarting the Extension Development Host (F5 again)

### Extension Not Loading?
1. Check the **Output** panel for activation messages
2. Look for "Basic Chat Participant extension is now active!" in the console
3. Ensure all dependencies are installed: `npm install`

## 📁 Project Files

- `src/extension.ts` - Main extension code with your chat participant
- `package.json` - Extension configuration (defines the chat participant)
- `.vscode/launch.json` - Debug configuration for F5 testing

## 🎯 Next Steps

Once you confirm it's working, you can:
1. **Modify responses** in `src/extension.ts`
2. **Add new commands** and functionality
3. **Integrate with AI models** for smarter responses
4. **Add file operations** or other VS Code features

**Happy Testing! 🎉**

---

*This extension was created for learning VS Code chat participant development.*
