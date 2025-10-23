# Credit Card Statement Parser - Backend

## Features
- ✅ Parse statements from 5 major banks
- ✅ AI-powered fallback with OpenAI GPT-4
- ✅ Batch processing (up to 15 files)
- ✅ Transaction categorization
- ✅ Spending analytics
- ✅ Data validation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create .env file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to .env:
```
OPENAI_API_KEY=sk-your-key-here
```

## Running Locally

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server runs on http://localhost:5000

## API Endpoints

### POST /api/parse
Parse single PDF statement
- Body: multipart/form-data with 'statement' field
- Returns: Parsed data with confidence score

### POST /api/parse-batch
Parse multiple PDF statements
- Body: multipart/form-data with 'statements' field (array)
- Returns: Array of parsed results

### GET /api/health
Health check endpoint

### GET /api/banks
Get list of supported banks

## Testing

Test with cURL:
```bash
curl -X POST http://localhost:5000/api/parse \
  -F "statement=@path/to/statement.pdf"
```

## Deployment

## Environment Variables Required for Production
- OPENAI_API_KEY
- NODE_ENV=production
- ALLOWED_ORIGINS (your frontend URL)

## Notes
- Max file size: 10MB
- Max files in batch: 15
- Supported formats: PDF only
- AI parsing requires OpenAI API key