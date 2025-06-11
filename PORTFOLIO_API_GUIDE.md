# 🔍 Portfolio Search with REST API + AI Integration

Your chat participant now includes **Portfolio Search** functionality that combines REST API calls with AI analysis! This demonstrates the full workflow: Natural Language → AI Function Detection → REST API Call → AI Analysis → Smart Response.

## 🚀 How to Test Portfolio Search + Math Functions

### Step 1: Launch Extension Development Host
1. Press **F5** in VS Code
2. Wait for the new "Extension Development Host" window to open

### Step 2: Open Chat Panel
- Press `Ctrl+Alt+I` or go to `View > Chat`

### Step 3: Test Portfolio Search (REST API + AI)

Try these **portfolio search examples**:

```
@assistant Search for design projects
@assistant Find user information
@assistant Show me portfolio data
@assistant Search for projects by John
@assistant What portfolio information do you have?
@assistant Find me some development projects
```

### Step 4: Test Math Functions

Try these **math examples**:

```
@assistant Add 5 and 3
@assistant What is 10 times 4?
@assistant Subtract 7 from 15
```

## 🔄 How Portfolio Search Works

### 1. **Natural Language Processing**
- You ask: "Search for design projects"
- AI interprets this as a portfolio search request

### 2. **REST API Call**
- Fetches real data from JSONPlaceholder API
- Gets user data: `https://jsonplaceholder.typicode.com/users`
- Gets project data: `https://jsonplaceholder.typicode.com/posts`

### 3. **Data Processing**
- Combines users and posts into portfolio structure
- Limits data for demo purposes (3 users, 10 projects)

### 4. **AI Analysis**
- Sends portfolio data + your query to LLM
- AI analyzes the data contextually
- Provides intelligent, conversational response

### 5. **Smart Response**
- Returns AI-generated analysis
- Answers your specific question about the portfolio data

## 🧪 Expected Results

### ✅ **Portfolio Search Example**
Input: `@assistant Search for design projects`

Expected Output:
```
🔍 Searching Portfolio: "design projects"

⏳ Calling REST API and analyzing with AI...

🤖 AI Analysis:

Based on the portfolio data, I found several projects that might interest you. 
While there aren't specifically "design" titled projects in the current dataset, 
I can see projects from users like Leanne Graham, Ervin Howell, and Clementine Bauch. 

The projects include:
- "sunt aut facere repellat provident occaecati" by User 1
- "qui est esse" by User 1  
- "ea molestias quasi exercitationem" by User 2

Would you like me to search for a specific user's projects or provide more details about any of these?
```

### ✅ **User Information Search**
Input: `@assistant Find user information`

Expected Output:
```
🔍 Searching Portfolio: "user information"

⏳ Calling REST API and analyzing with AI...

🤖 AI Analysis:

I found information for 3 users in the portfolio:

1. **Leanne Graham** (User 1)
   - Email: Sincere@april.biz
   - Website: hildegard.org
   - Company: Romaguera-Crona

2. **Ervin Howell** (User 2)  
   - Email: Shanna@melissa.tv
   - Website: anastasia.net
   - Company: Deckow-Crist

3. **Clementine Bauch** (User 3)
   - Email: Nathan@yesenia.net
   - Website: ramiro.info
   - Company: Romaguera-Jacobson

Each user has associated projects in the portfolio. Would you like details about a specific user's work?
```

## 🎯 **Available Portfolio Queries**

### 🔍 **General Search**
- "Search for portfolio data"
- "Show me what's available"
- "Find portfolio information"

### 👤 **User-Focused**
- "Find user information"
- "Search for John's projects"
- "Show me users in the portfolio"

### 📁 **Project-Focused**
- "Search for design projects"
- "Find development projects"
- "Show me project titles"

### 🎨 **Topic-Based**
- "Find anything related to [topic]"
- "Search for [keyword] projects"

## 🔧 **Technical Architecture**

### **Data Flow:**
```
User Query → AI Parser → Function Router
    ↓
[Math Function] OR [Portfolio Search]
    ↓                     ↓
Direct Calculation    REST API Call
    ↓                     ↓
Format Result        AI Analysis
    ↓                     ↓
Display Result       Smart Response
```

### **APIs Used:**
- **JSONPlaceholder API**: Free fake REST API for demo
  - Users: `https://jsonplaceholder.typicode.com/users`
  - Posts: `https://jsonplaceholder.typicode.com/posts`
- **VS Code Language Models**: For AI interpretation and analysis

## 🛠️ **Debugging the Full Pipeline**

1. **Set breakpoints** in `src/extension.ts`:
   - `parseFunctionCallWithLLM` (AI function detection)
   - `SearchPortfolio` (REST API + AI analysis)
   - Math functions (AddTwoNumbers, etc.)

2. **Watch the flow**:
   - See how AI parses your natural language
   - Monitor REST API calls and responses
   - Observe AI analysis of portfolio data

3. **Check logs**:
   - Debug Console shows function execution
   - Network tab shows API calls
   - AI responses are streamed live

## 💡 **Key Features Demonstrated**

### ✨ **AI-Powered Function Routing**
- Single AI determines whether to do math or search portfolio
- Intelligent parameter extraction from natural language
- Graceful handling of ambiguous requests

### 🌐 **REST API Integration**
- Real HTTP calls to external APIs
- Error handling for network issues
- Data transformation and processing

### 🤖 **LLM-Powered Analysis**
- AI analyzes API responses in context
- Conversational, intelligent responses
- Contextual understanding of user queries

### 🎨 **Rich User Experience**
- Loading indicators during API calls
- Formatted, professional responses
- Smart follow-up suggestions

## 🚀 **Extending the System**

You can easily add more functions:

1. **New API Functions**: Weather, stocks, news, etc.
2. **More Math Operations**: Division, square root, etc.
3. **Complex Workflows**: Multi-step API calls, data aggregation
4. **Enhanced AI**: Better context understanding, memory

**Ready to test your AI + REST API powered assistant? Press F5 and try: "Search for design projects"! 🔍✨**
