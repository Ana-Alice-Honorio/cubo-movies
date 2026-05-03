import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function setupCors() {
  const bucket = process.env.AWS_S3_BUCKET;

  if (!bucket) {
    console.error('AWS_S3_BUCKET not set in .env');
    process.exit(1);
  }

  const corsConfiguration = {
    CORSRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        AllowedOrigins: ['http://localhost:3000', 'http://localhost:3001'],
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3000,
      },
    ],
  };

  try {
    const command = new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: corsConfiguration,
    });

    await s3Client.send(command);
    console.log(`✅ CORS configurado com sucesso no bucket ${bucket}`);
    console.log('Allowed origins: http://localhost:3000, http://localhost:3001');
  } catch (error) {
    console.error('❌ Erro ao configurar CORS:', error);
    process.exit(1);
  }
}

setupCors();
