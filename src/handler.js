import { tierRuleByAccess } from './utils/utils';
import multipart from 'aws-lambda-multipart-parser';
const AWS = require('aws-sdk');

export async function parsePropectClientBase(event) {
  const data = multipart.parse(event, true);
  const fileData = (Buffer.from(data.file.content, 'base64')).toString();
  const result = fileData.split('\n');

  const header = `${result.shift().replace(/\r/g, '')};Tier`;
  const newDataArr = [];
  for (const data of result) {
    if (data) {
      const accessNumber = Number(data.split(';')[1].replace(/\./g, ''));
      const tier = tierRuleByAccess(accessNumber);
      newDataArr.push(`${data.replace(/\r/g, '')};${tier}`);
    }
  }
  newDataArr.unshift(header);

  const date = new Date();
  const dateTime = `${date.getUTCMonth() + 1}_${date.getUTCFullYear()}_${date.getTime()}`;
  const filename = `PROSPECT_${dateTime}`;
  const savedCSVFileName = `${filename}.csv`;

  const fileContent = newDataArr.join('\n');

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: savedCSVFileName,
    Body: fileContent,
  };

  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
  });

  try {
    await s3.putObject(params).promise();
  } catch (err) {
    throw err;
  }

  const responseS3linkURL = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${savedCSVFileName}`;

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      success: true,
      url: responseS3linkURL,
    }),
  };
}