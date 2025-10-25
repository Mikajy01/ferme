import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { Express } from 'express'
import * as path from 'path';1

@Injectable()
export class FileStorageService {
  async storePdf(file: Express.Multer.File, folder: string, filename: string): Promise<string> {
    const dir = path.join('./storage', folder);
    const filePath = path.join(dir, `${filename}.pdf`);

    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, file.buffer);

    return filePath;
  }

  async storeImage(file: Express.Multer.File, folder: string, filename: string): Promise<string> {
    const extension = path.extname(file.originalname);
    const dir = path.join('./storage', folder);
    const filePath = path.join(dir, `${filename}${extension}`);

    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, file.buffer);

    return filePath;
  }
}
