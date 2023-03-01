import { Controller, Get, Post, Res, Body, Header, Param, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AppService } from './app.service';
import { DocumentService } from './document.service';
import { Response } from 'express';
import * as path from 'path';
import { PdfKitService } from './pdfkit.service';
import { createWriteStream } from 'fs';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly DocumentService: DocumentService,
    private readonly pdfKitService: PdfKitService
    ) {}

  @Post('generate')
  @Header('Access-Control-Allow-Origin', '*')
  async generateDocx(@Body() data: any, @Res() res: Response): Promise <any> {
    // const docxBuffer  = await this.appService.generateDocx(data);
    // const docxBuffer = await this.DocumentService.generateDocx(data);
    const pdfBuffer = await this.pdfKitService.fillForm();
    // const pdfBuffer = await this.pdfKitService.getTemplate();
    return 'true';
  }

  @Get('pdfList')
  async getPdfFiles() {
    return await this.pdfKitService.getPdfList();
  }

  @Get('pdf/:filename')
  async getPdf(@Param('filename') filename: string, @Res() res: Response) {

    let response = await this.pdfKitService.getPdfFile(filename);

    if (response) {
      // res.setHeader('Content-Type', 'application/pdf');
      res.send(response);
    } else {
      res.status(404).send('File not found');
    }
  }
  
  @Post('savePdf')
  @UseInterceptors(FileInterceptor('file'))
  async savePdf(@UploadedFile() file): Promise<any> {

    const fileName = file.originalname;
    const templateDirectory = path.join(__dirname, '..', 'templates');
    const filePath = `${templateDirectory}/${fileName}`;

    // Write file to the path
    fs.writeFileSync(filePath, file.buffer);

    return { message: 'PDF saved successfully' };
  }

  // Generate PDF with dynamic data
  @Get('generatePdf/:fileName')
  async generatePdf(@Param('fileName') filename: string, @Res() res: Response) {
    const pdfBuffer = await this.pdfKitService.generatePdf(filename);
    // const pdfBuffer = await this.pdfKitService.fetchSignatre();

    res.send(pdfBuffer)
  }

}
