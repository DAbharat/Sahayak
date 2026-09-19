# AWS Setup — GovScheme Navigator

## Prerequisites

1. An AWS account
2. AWS CLI installed and configured
3. Python with boto3

## Step 1: Configure AWS CLI

```bash
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region name: `us-east-1` (or `ap-south-1` for India)
- Default output format: `json`

Verify:
```bash
aws sts get-caller-identity
```

## Step 2: Enable Amazon Bedrock Model Access

1. Go to AWS Console → **Amazon Bedrock** → **Model access**
2. Click **Manage model access**
3. Enable: **Google Gemma 3 4B** for your region
4. Wait for access to be granted (usually instant to a few hours)

Verify:
```bash
aws bedrock list-foundation-models --region us-east-1 --query "modelSummaries[?modelId=='google.gemma-3-4b-it-v1:0']"
```

## Step 3: Create S3 Buckets

Create buckets for audio (Transcribe) and documents (Textract):

```bash
# Replace 'your-project-name' with your unique prefix
aws s3 mb s3://govscheme-navigator-audio --region us-east-1
aws s3 mb s3://govscheme-navigator-docs --region us-east-1
```

## Step 4: IAM Policy

Create a policy that grants minimum required permissions.

### Create `govscheme-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockConverse",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/*"
    },
    {
      "Sid": "TranscribeJobs",
      "Effect": "Allow",
      "Action": [
        "transcribe:StartTranscriptionJob",
        "transcribe:GetTranscriptionJob",
        "transcribe:ListTranscriptionJobs"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PollyTTS",
      "Effect": "Allow",
      "Action": [
        "polly:SynthesizeSpeech",
        "polly:DescribeVoices"
      ],
      "Resource": "*"
    },
    {
      "Sid": "TextractExtraction",
      "Effect": "Allow",
      "Action": [
        "textract:AnalyzeDocument",
        "textract:StartDocumentAnalysis",
        "textract:GetDocumentAnalysis"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3AudioDocuments",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::govscheme-navigator-audio/*",
        "arn:aws:s3:::govscheme-navigator-docs/*"
      ]
    }
  ]
}
```

### Apply the policy:

```bash
# Create the policy
aws iam create-policy \
  --policy-name GovSchemeNavigatorPolicy \
  --policy-document file://govscheme-policy.json

# Create a user (for dev) or use IAM Role (for production)
aws iam create-user --user-name govscheme-dev

# Attach the policy
aws iam attach-user-policy \
  --user-name govscheme-dev \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/GovSchemeNavigatorPolicy

# Create access keys
aws iam create-access-key --user-name govscheme-dev
```

## Step 5: Configure .env

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=google.gemma-3-4b-it-v1:0
AWS_PROFILE=govscheme-dev
POLLY_VOICE_ID=Aditi
TRANSCRIBE_S3_BUCKET=govscheme-navigator-audio
TEXTRACT_S3_BUCKET=govscheme-navigator-docs
```

Or use environment variables directly:
```bash
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_REGION=us-east-1
```

## Step 6: Test Each AWS Service

### Bedrock:
```bash
aws bedrock-runtime invoke-model \
  --model-id google.gemma-3-4b-it-v1:0 \
  --body '{"prompt":"Hello","max_tokens":100}' \
  --cli-binary-format raw-in-base64-out \
  output.json
```

### Polly:
```bash
aws polly synthesize-speech \
  --output-format mp3 \
  --voice-id Aditi \
  --text "नमस्ते" \
  test.mp3
```

### Transcribe (requires audio file + S3 bucket):
```bash
aws s3 cp test.mp3 s3://govscheme-navigator-audio/test.mp3
aws transcribe start-transcription-job \
  --transcription-job-name test-job-1 \
  --language-code hi-IN \
  --media-format mp3 \
  --media MediaFileUri=s3://govscheme-navigator-audio/test.mp3
```

## Hindi Polly Voices

| Voice | Engine | Region Availability |
|-------|--------|---------------------|
| Aditi | Standard | All regions |
| Kajal | Neural | us-east-1, ap-south-1, eu-west-1 |

For best quality, use **Kajal** in `us-east-1` or `ap-south-1`:
```
POLLY_VOICE_ID=Kajal
POLLY_ENGINE=neural
```

## CloudWatch Logging (Optional)

The backend uses structured JSON logging. To send to CloudWatch:
```bash
# Install CloudWatch agent or use boto3 logging handler
pip install watchtower
```

Add to `.env`:
```
CLOUDWATCH_LOG_GROUP=/govscheme-navigator/backend
```

## Production: Use IAM Roles

For EC2/ECS/Lambda deployment, attach the IAM role directly — no access keys needed.
The application uses standard boto3 credential resolution which automatically uses IAM roles.
