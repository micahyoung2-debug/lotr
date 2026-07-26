exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ content: [{ text: JSON.stringify({ error: 'API key not configured in environment' }) }] }) 
        };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return { 
                statusCode: 400, 
                body: JSON.stringify({ content: [{ text: JSON.stringify({ error: 'No prompt provided' }) }] }) 
            };
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1000,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.error?.message || JSON.stringify(data);
            console.error('Anthropic API error:', errorMsg);
            return { 
                statusCode: 200,
                body: JSON.stringify({ content: [{ text: JSON.stringify({ error: errorMsg }) }] }) 
            };
        }

        return { 
            statusCode: 200, 
            body: JSON.stringify(data) 
        };
    } catch (error) {
        console.error('Function error:', error.message);
        return { 
            statusCode: 200,
            body: JSON.stringify({ content: [{ text: JSON.stringify({ error: error.message }) }] }) 
        };
    }
};
