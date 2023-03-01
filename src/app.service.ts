import { Injectable } from '@nestjs/common';
import * as PizZip from 'pizzip';
import * as fs from 'fs';


@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async generateDocx(data: any): Promise<any> {
    const Docxtemplater = require("docxtemplater")
    const pdfMakePrinter = require('pdfmake/src/printer');

    const doc = new Docxtemplater();

    const dataDir = "../templates";
    const content = fs.readFileSync( `templates/sample.docx`)

    const zip = new PizZip(content);
    
    // Update content of docx with new data
    doc.loadZip(zip);
    doc.setData(data);
    doc.render(data);
    
    // Create a zip of docx
    const docxBuffer = doc.getZip().generate({ type: 'nodebuffer' });

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Save file locally in nest server
    fs.writeFileSync(`${dataDir}/document.docx`, docxBuffer);

    // Libre code start
    // const libre = require('libreoffice-convert');
    // libre.convertAsync = require('util').promisify(libre.convert);

    // let pdfBuf = await libre.convertAsync(docxBuffer, '.pdf', undefined);
    // console.log(pdfBuf)

    // Libre code end
    // Convert the buffer to a PDF file using pdfmake

    return Buffer.from(docxBuffer).toString('base64');

  }

  async convertDocxToPdf(): Promise<any> {
    // try {
    //   const dataDir = "../templates";
    //   const libre = require('libreoffice-convert');
    //   libre.convertAsync = require('util').promisify(libre.convert);
    //   const path = require('path');
    //   const ext = '.pdf'
    //   const fs = require('fs').promises;

    //   const inputPath = `${dataDir}/Sample.docx`;
    //   const outputPath = `${dataDir}/output${ext}`;

    //   // Read file
    //   const docxBuf = await fs.readFile(inputPath);

    //   // Convert it to pdf format with undefined filter (see Libreoffice docs about filter)
    //   let pdfBuf = await libre.convertAsync(docxBuf, ext, undefined);

    //   console.log('docxBuf buffer', pdfBuf)

      
    //   // Here in done you have pdf file which you can save or transfer in another stream
    //   // await fs.writeFile(outputPath, pdfBuf);
    // } catch (e) {
    //   console.log("Error", e)
    // }  
  }

  
  
  
}
