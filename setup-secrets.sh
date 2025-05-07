#!/bin/bash

# Google Cloud Project Configuration
PROJECT_ID="fait-444705"
PROJECT_NUMBER="526297187726"

# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Create secrets (this will prompt for the values)
echo "Creating MongoDB URI secret..."
gcloud secrets create MONGODB_URI --replication-policy="automatic"

echo "Creating OpenAI API key secret..."
gcloud secrets create OPENAI_API_KEY --replication-policy="automatic"

# Grant Secret Manager access to Cloud Build service account
echo "Granting Secret Manager access to Cloud Build service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

echo "Secrets created. Now you need to set their values."
echo "Run the following commands to set your secrets:"
echo "echo -n 'your_mongodb_uri' | gcloud secrets versions add MONGODB_URI --data-file=-"
echo "echo -n 'your_openai_api_key' | gcloud secrets versions add OPENAI_API_KEY --data-file=-"
