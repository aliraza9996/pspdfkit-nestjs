import { Injectable, Inject } from '@nestjs/common';
import { readFileSync } from 'fs';
import { PdfKitService } from './pdfkit.service';
import { forwardRef } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FormTemplateService {
  constructor(
    @Inject(forwardRef(() => PdfKitService))
    private readonly PdfKitService: PdfKitService,
    @Inject('DATA') private readonly data,
  ) {}
  
  // Get data for form filling, will be used later to fetch data from the db
  async getDataForPdfGeneration(id) {
    if(this.data[id]) {
      return this.data[id];
    }else {
      return null;
    }
  }

  // Get a list of all available templates to show on the front-end
  async getPdfList() {
    const pdfDirectory = path.join(__dirname, '..', 'templates');
    const files = await fs.promises.readdir(pdfDirectory);
    const pdfFiles = files.filter(file => path.extname(file) === '.pdf');
    return pdfFiles;
  }

  // Get specific PDF template, in the form of base64 buffer
  async getPdfFile(filename) {
    const pdfDirectory = path.join(__dirname, '..', 'templates');
    const filePath = path.join(pdfDirectory, filename);
    let fileBuffer = null;
    try {
      fileBuffer = await fs.promises.readFile(filePath);
    } catch (e) {
      console.log(e)
    }

    return Buffer.from(fileBuffer).toString('base64');
  }

  // Generate the filled pdf with dynamic data, data will be fetched based on the entry id, can be multiple.
  // Multiple documents will be added in a single pdf file.
  async generatePdf(filename, entryIds) {
    const pdfDirectory = path.join(__dirname, '..', 'templates');
    const filePath = path.join(pdfDirectory, filename);
    const fileExists = fs.existsSync(filePath);

    // If file does not exist
    if (!fileExists) {
      return {message: "File does not exist"}
    }

    return await this.PdfKitService.generateMultiplePdfs(filePath, entryIds);
  }
}