# **App Name**: ExpenseWise

## Core Features:


- Custom Authentication: Secure user authentication using bcrypt and JWT, with role-based access control (Admin, Manager, Employee).
- Expense Submission: Allow employees to submit expenses with details such as amount, currency, category, description, and attachments. Also handle the OCR parsing on attachment to pre-fill some details using the Tesseract.js tool
- Multi-Level Approval Workflow: Implement a configurable multi-level approval process for expenses, based on predefined rules and roles.
- Role-Based Dashboards: Provide role-specific dashboards (Admin, Manager, Employee) with relevant information and actions.
- Reporting and Analytics: Generate reports and analytics on expense data for better insights and decision-making.
- Currency Conversion: Handle currency conversion using a local data file, with an optional admin toggle to enable live exchange rates from an external API.

## Style Guidelines:

- Primary color: Deep sky blue (#3498DB), evoking trust and clarity in financial processes.
- Background color: Very light gray (#F0F2F5), providing a neutral backdrop that emphasizes content and interactive elements. Should adjust itself for dark mode as well.
- Accent color: Emerald green (#2ECC71), highlighting approval actions and success states.
- Headline font: 'Space Grotesk', sans-serif, providing a computerized and techy look suitable for headlines.
- Body font: 'Inter', sans-serif, offering a modern, neutral look suitable for continuous reading.
- Use minimalist and clear icons for expense categories and actions.
- Design a clean and intuitive layout with clear information hierarchy, to ensure ease of use.