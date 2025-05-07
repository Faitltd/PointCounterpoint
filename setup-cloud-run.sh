#!/bin/bash

# Google Cloud Project Configuration
PROJECT_ID="fait-444705"
PROJECT_NUMBER="526297187726"
REGION="us-central1"

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com \
    run.googleapis.com \
    secretmanager.googleapis.com \
    artifactregistry.googleapis.com \
    containerregistry.googleapis.com

# Create Secret Manager secrets
echo "Creating Secret Manager secrets..."
echo "Enter your MongoDB URI:"
read -s MONGODB_URI
echo "Enter your OpenAI API key:"
read -s OPENAI_API_KEY

# Create secrets
echo "Creating secrets in Secret Manager..."
echo -n "$MONGODB_URI" | gcloud secrets create MONGODB_URI --replication-policy="automatic" --data-file=-
echo -n "$OPENAI_API_KEY" | gcloud secrets create OPENAI_API_KEY --replication-policy="automatic" --data-file=-

# Grant Secret Manager access to Cloud Build service account
echo "Granting Secret Manager access to Cloud Build service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Grant Cloud Run Admin role to Cloud Build service account
echo "Granting Cloud Run Admin role to Cloud Build service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
    --role="roles/run.admin"

# Grant IAM Service Account User role to Cloud Build service account
echo "Granting IAM Service Account User role to Cloud Build service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

echo "Setup complete! You can now deploy your application using Cloud Build."
echo "To manually trigger a build, run:"
echo "gcloud builds submit --config=cloudbuild.yaml"
