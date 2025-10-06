import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { EnvSchema } from 'src/core/config/validate-env';
import { CommonException } from 'src/core/exception/common-exception';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly cloudFrontDomain: string;

  constructor(private readonly configService: ConfigService<EnvSchema, true>) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET');
    this.cloudFrontDomain = this.configService.get<string>('CLOUDFRONT_DOMAIN');
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'images') {
    const fileExtension = file.originalname.split('.').pop();

    if (!fileExtension) {
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.INVALID_IMAGE),
      );
    }

    const key = `${folder}/${uuid()}-${Date.now()}.${fileExtension}`;

    const params: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(params));
      return `${this.getCloudFrontBaseUrl()}${key}`;
    } catch (error) {
      console.error(error);
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.SAVE_IMAGE_FAIL),
      );
    }
  }

  async deleteImage(imageUrl: string) {
    const key = imageUrl.replace(this.getCloudFrontBaseUrl(), '');

    const params: DeleteObjectCommandInput = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await this.s3Client.send(new DeleteObjectCommand(params));
    } catch (error) {
      console.error(error);
      throw new CommonException(
        ResponseStatusFactory.create(ResponseCode.DELETE_IMAGE_FAIL),
      );
    }
  }

  private getCloudFrontBaseUrl() {
    return `https://${this.cloudFrontDomain}/`;
  }
}
