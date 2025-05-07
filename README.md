# News Perspectives App

A web application that displays news articles from different perspectives (liberal, conservative, and neutral).

## Project Structure

```
news-perspectives-app/
├── backend/
│   ├── models/
│   │   └── Article.js
│   ├── routes/
│   │   └── news.js
│   ├── services/
│   │   └── summaryService.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── ArticleList.js
    │   │   ├── NavBar.js
    │   │   ├── PerspectiveToggle.js
    │   │   └── SummaryView.js
    │   ├── App.css
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Prerequisites

- Node.js (v14 or higher)
- Supabase account and project
- OpenAI API key
- NewsAPI key
- Docker (for containerization)
- Google Cloud account (for Cloud Run deployment)

## Local Development Setup

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables (see `.env.example` for a template):
   ```
   # OpenAI API Key - Get from https://platform.openai.com/api-keys
   OPENAI_API_KEY=your_openai_api_key_here

   # NewsAPI Key - Get from https://newsapi.org/register
   NEWS_API_KEY=your_newsapi_key_here

   # Supabase Configuration
   SUPABASE_URL=https://ueqselkevtzpzgcapbzc.supabase.co
   SUPABASE_KEY=your_supabase_key_here

   # Server Configuration
   PORT=5001
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Docker Setup

You can run the entire application using Docker Compose:

```
docker-compose up
```

This will start both the frontend and backend services.

## Deployment to Google Cloud Run

### Manual Deployment

1. Build and push the backend image:
   ```
   cd backend
   gcloud builds submit --tag gcr.io/[PROJECT_ID]/news-perspectives-backend
   gcloud run deploy news-perspectives-backend --image gcr.io/[PROJECT_ID]/news-perspectives-backend --platform managed --region us-central1 --allow-unauthenticated --set-env-vars OPENAI_API_KEY=[YOUR_OPENAI_API_KEY],NEWS_API_KEY=[YOUR_NEWS_API_KEY],SUPABASE_URL=[YOUR_SUPABASE_URL],SUPABASE_KEY=[YOUR_SUPABASE_KEY]
   ```

2. Build and push the frontend image:
   ```
   cd frontend
   gcloud builds submit --tag gcr.io/[PROJECT_ID]/news-perspectives-frontend
   gcloud run deploy news-perspectives-frontend --image gcr.io/[PROJECT_ID]/news-perspectives-frontend --platform managed --region us-central1 --allow-unauthenticated
   ```

### Automated Deployment with Cloud Build

1. Set up secret environment variables in Secret Manager:
   ```
   gcloud secrets create OPENAI_API_KEY --replication-policy automatic
   gcloud secrets create NEWS_API_KEY --replication-policy automatic
   gcloud secrets create SUPABASE_URL --replication-policy automatic
   gcloud secrets create SUPABASE_KEY --replication-policy automatic

   echo -n "your_openai_api_key" | gcloud secrets versions add OPENAI_API_KEY --data-file=-
   echo -n "your_news_api_key" | gcloud secrets versions add NEWS_API_KEY --data-file=-
   echo -n "your_supabase_url" | gcloud secrets versions add SUPABASE_URL --data-file=-
   echo -n "your_supabase_key" | gcloud secrets versions add SUPABASE_KEY --data-file=-
   ```

2. Grant Secret Manager access to Cloud Build service account:
   ```
   gcloud projects add-iam-policy-binding [PROJECT_ID] \
     --member="serviceAccount:[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. Set up a Cloud Build trigger connected to your GitHub repository.

4. Push changes to your repository to trigger the deployment.

## GitHub Setup

1. Initialize Git repository:
   ```
   git init
   ```

2. Add files to Git:
   ```
   git add .
   ```

3. Commit changes:
   ```
   git commit -m "Initial commit"
   ```

4. Add GitHub remote:
   ```
   git remote add origin https://github.com/yourusername/news-perspectives.git
   ```

5. Push to GitHub:
   ```
   git push -u origin main
   ```
