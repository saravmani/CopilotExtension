import * as vscode from 'vscode';

/**
 * Portfolio API utilities for REST API interactions
 */

/**
 * Searches for portfolio items using JSONPlaceholder API
 * @param query - Search query term
 * @param model - VS Code language model for AI analysis
 * @returns Promise<string> - Formatted search results
 */
export async function SearchPortfolio(query: string, model: vscode.LanguageModelChat): Promise<string> {
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

/**
 * Fetches all portfolio items (for debugging/testing)
 * @returns Promise<string> - List of all available items
 */
export async function getAllPortfolioItems(): Promise<string> {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json() as Array<{
            userId: number;
            id: number;
            title: string;
            body: string;
        }>;

        return `📋 **All Portfolio Items** (${posts.length} total)\n\n${posts.slice(0, 10).map(post => 
            `**${post.id}.** ${post.title}\n`
        ).join('')}\n\n*Showing first 10 items. Use search to find specific content.*`;

    } catch (error) {
        console.error('Error fetching portfolio items:', error);
        return `❌ **Failed to fetch portfolio items:** ${error}`;
    }
}

/**
 * Handles portfolio search function calls with validation and stream output
 * @param functionName - Name of the portfolio function to execute
 * @param args - Arguments for the function
 * @param prompt - Original user prompt
 * @param stream - VS Code chat response stream
 * @param model - VS Code language model for AI analysis
 */
export async function handlePortfolioFunction(
    functionName: string,
    args: any[],
    prompt: string,
    stream: vscode.ChatResponseStream,
    model: vscode.LanguageModelChat
): Promise<void> {
    // Validate arguments
    if (args.length !== 1) {
        stream.markdown(`❌ **Error**: ${functionName} requires exactly 1 parameter (search query)`);
        return;
    }

    stream.markdown(`🔍 **Searching Portfolio**: "${args[0]}"`);
    stream.markdown('\n\n⏳ *Calling REST API and analyzing with AI...*');

    try {
        const result = await SearchPortfolio(args[0], model);

        // Display portfolio search results
        stream.markdown(`\n\n🤖 **AI Analysis**:`);
        stream.markdown(`\n\n${result}`);
    } catch (error) {
        stream.markdown(`\n\n❌ **Error**: Portfolio search failed - ${error}`);
    }
}

/**
 * Portfolio functions registry for the extension
 */
export const portfolioFunctions = {
    SearchPortfolio: {
        func: SearchPortfolio,
        description: "Searches and analyzes portfolio data using REST API and AI",
        parameters: ["query"],
        example: "Search for projects by John",
        type: "api"
    }
};
