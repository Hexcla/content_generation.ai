# AI Content Studio

A full-stack application that generates AI-powered content based on website URLs and user preferences. The application features a modern React frontend with Material-UI components and a Python Flask backend that integrates with OpenAI's GPT-4 and DALL-E APIs.

## Features

- URL-based content scraping
- AI-powered content generation with customizable tone and keywords
- AI-generated images
- Markdown preview and editing
- Content download as ZIP file (includes markdown and images)
- Modern, responsive UI with Material-UI components
- Dark/light mode support

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-content-studio
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the root directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Running the Application

1. Start the backend server:
```bash
python app.py
```

2. In a new terminal, start the frontend development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter a URL in the input field
2. Select the desired tone and content type
3. Add optional keywords (comma-separated)
4. Click "Generate Content"
5. Preview the generated content
6. Download the content as a ZIP file

## Project Structure

```
ai-content-studio/
├── src/
│   └── App.jsx          # Main React application
├── app.py               # Flask backend server
├── requirements.txt     # Python dependencies
├── package.json         # Node.js dependencies
└── README.md           # Project documentation
```

## Technologies Used

- Frontend:
  - React
  - Material-UI
  - Axios
  - React-Markdown

- Backend:
  - Flask
  - OpenAI API
  - BeautifulSoup4
  - Flask-CORS

## License

MIT 