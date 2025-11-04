import express from 'express';
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

// Function to sanitize user input to prevent XSS
const sanitizeHTML = (str) => {
  return str.replace(/[&<>"']/g, (match) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match];
  });
};

// A simple function to extract keywords from an idea
const extractKeywords = (idea) => {
  const stopWords = ['a', 'an', 'the', 'my', 'is', 'in', 'it', 'to', 'for', 'of', 'with', 'on'];
  const words = idea.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  return words.filter(word => !stopWords.includes(word) && word.length > 2);
};

// A simple mapping of keywords to suggested tools
const toolSuggestions = {
  'report': ['Excel', 'Google Sheets', 'Tableau'],
  'website': ['Node.js', 'React', 'Vue', 'Angular'],
  'database': ['MySQL', 'PostgreSQL', 'MongoDB'],
  'tracker': ['Spreadsheet', 'Notion', 'Asana'],
  'finance': ['Accounting software', 'Budgeting apps'],
  'email': ['Mailchimp', 'SendGrid', 'Nodemailer'],
  'social media': ['Buffer', 'Hootsuite', 'Zapier'],
};

const generateAutomationPlan = (idea) => {
  const sanitizedIdea = sanitizeHTML(idea);
  const keywords = extractKeywords(idea);
  let suggestedTools = [];
  keywords.forEach(keyword => {
    if (toolSuggestions[keyword]) {
      suggestedTools = [...suggestedTools, ...toolSuggestions[keyword]];
    }
  });

  // Remove duplicate tools
  suggestedTools = [...new Set(suggestedTools)];

  const plan = `
    <h2>Automation Plan for: ${sanitizedIdea}</h2>
    <h3>1. Define the Goal</h3>
    <p>Clearly articulate the primary objective of this automation. What specific problem are you trying to solve with "${sanitizedIdea}"?</p>

    <h3>2. Identify Key Steps</h3>
    <p>Break down the process into smaller, manageable steps. For an idea like "${sanitizedIdea}", this could involve:</p>
    <ul>
      ${keywords.map(kw => `<li>Analyze requirements related to <strong>${sanitizeHTML(kw)}</strong>.</li>`).join('')}
      <li>Design the workflow and data flow.</li>
      <li>Develop the core automation logic.</li>
      <li>Test the system thoroughly.</li>
    </ul>

    <h3>3. Suggested Tools and Technologies</h3>
    <p>Based on your idea, here are some tools you might consider:</p>
    ${suggestedTools.length > 0 ? `<ul>${suggestedTools.map(tool => `<li>${tool}</li>`).join('')}</ul>` : '<p>No specific tools suggested. Consider general-purpose tools like Python or Zapier.</p>'}

    <h3>4. Create a Timeline</h3>
    <p>Estimate the time required for each step and set a realistic timeline for completion.</p>
  `;

  return plan;
};

app.post('/prompt', (req, res) => {
  const { idea } = req.body;
  if (!idea) {
    return res.status(400).send('Idea is required.');
  }
  const automationPlan = generateAutomationPlan(idea);
  res.send(automationPlan);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
