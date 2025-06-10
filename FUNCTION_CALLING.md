# 🔧 Function Calling Feature Guide

Your chat participant now supports **function calling**! Here's how to test and use it:

## 🚀 How to Test Function Calling

### Step 1: Launch Extension Development Host
1. Press **F5** in VS Code
2. Wait for the new "Extension Development Host" window to open

### Step 2: Open Chat Panel
- Press `Ctrl+Alt+I` or go to `View > Chat`

### Step 3: Test Function Calls

Try these examples in the chat:

```
@assistant AddTwoNumbers(5, 3)
@assistant AddTwoNumbers(10, 25)
@assistant AddTwoNumbers(-5, 15)
@assistant AddTwoNumbers(100, 200)
```

## 🧪 Expected Results

### ✅ **Successful Function Call**
Input: `@assistant AddTwoNumbers(5, 3)`

Expected Output:
```
🔧 Function Call: AddTwoNumbers(5, 3)

✅ Result: 8

🧮 Calculation: 5 + 3 = 8
```

### ❌ **Error Handling**
Input: `@assistant AddTwoNumbers(5)`

Expected Output:
```
❌ Error: AddTwoNumbers requires exactly 2 parameters

Usage: AddTwoNumbers(5, 3)
```

### 🔍 **Help Command**
Input: `@assistant help`

Shows available functions and examples.

## 🎯 **Follow-up Suggestions**

After any response, you'll see clickable suggestions:
- 🧮 Add 10 + 5
- 🔢 Add 25 + 17
- 🔍 Learn about extensions
- ❓ Show help

## 🛠️ **Function Call Formats Supported**

- `AddTwoNumbers(5, 3)` ✅
- `AddTwoNumbers(5,3)` ✅ (no spaces)
- `AddTwoNumbers( 5 , 3 )` ✅ (extra spaces)
- `AddTwoNumbers(5.5, 3.2)` ✅ (decimals)
- `AddTwoNumbers(-5, 10)` ✅ (negative numbers)

## 🔧 **Debugging Function Calls**

1. Set breakpoints in `src/extension.ts`:
   - Line with `AddTwoNumbers` function (around line 6)
   - Line with `parseFunctionCall` (around line 35)
   - Switch statement for function execution (around line 45)

2. Launch debugger (F5) and test function calls
3. Step through the code to see how parameters are parsed and functions are executed

## 🎨 **Adding More Functions**

To add more functions, follow this pattern:

1. **Define the function**:
```typescript
function MultiplyNumbers(a: number, b: number): number {
    return a * b;
}
```

2. **Add to switch statement**:
```typescript
case 'MultiplyNumbers':
    if (functionCall.args.length !== 2) {
        stream.markdown('❌ **Error**: MultiplyNumbers requires exactly 2 parameters');
        return;
    }
    result = MultiplyNumbers(functionCall.args[0], functionCall.args[1]);
    break;
```

3. **Update help text** to include the new function

## 🎉 **Success Indicators**

Your function calling is working if:
- You see formatted output with function name, result, and calculation
- Follow-up suggestions include function call examples
- Error messages appear for invalid inputs
- Debugger hits breakpoints in your TypeScript code

**Happy Function Calling! 🚀**
