import { Injectable, Inject } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { HttpService } from '@nestjs/axios';
import { FormTemplateService } from './template.service';
import { forwardRef } from '@nestjs/common';
import { PDFDocument, PDFField, drawRectangle, degrees, drawImage, rgb } from 'pdf-lib';


@Injectable()
export class PdfKitService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => FormTemplateService))
    private readonly formTemplateService: FormTemplateService,
  ) {}
    
  // Fetch signature or image from any other URL
  async getImageData(url) {
    const response = await this.httpService.get(url, { responseType: 'arraybuffer' }).toPromise();
    return response.data;
  }

  // Fetch signature from our db
  async fetchSignatre(url) {
    if (url) {
      const response = await this.httpService.get(url).toPromise();
      const base64string = response.data.data;
      const base64Buffer = Buffer.from(base64string, 'base64');
      return base64Buffer;
    }
  }

  // Fill entry template
  async fillBlankEntry(filePath, data) {
    // Read file
    if (!filePath && data < 0) {
      return {message: 'Please select entry first'}
    }
    
    // Read the template
    const templateBytes = readFileSync(filePath);

    // Load PDF
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm() // Get form from PDF
    const pages = pdfDoc.getPages(); // Get all pages from the pdf
    const pageOne = pages[0]; // Can get page 1 like this

    //  Get form fields
    const fields = form.getFields(); // Get PDF form fields
    const fieldNames = fields.map(field => field.getName());  // Get field names

    const signatures = {};

    // const ownerSignatureBytes = await this.getImageData(ownerSignatureUrl); // If getting image from any other URL
    const ownerSignatureBytes = await this.fetchSignatre(data.owner_signature_url);
    const ownerSignatureImage = await pdfDoc.embedPng(ownerSignatureBytes);

    const riderSignatureBytes = await this.fetchSignatre(data.rider_signature_url);
    const riderSignatureImage = await pdfDoc.embedPng(riderSignatureBytes);

    const trainerSignatureBytes = await this.fetchSignatre(data.trainer_signature_url);
    const trainerSignatureImage = await pdfDoc.embedPng(trainerSignatureBytes);

    // Get signatures later from db
    signatures['owner_signature_img'] = ownerSignatureImage;
    signatures['rider_signature_img'] = riderSignatureImage;
    signatures['trainer_signature_img'] = trainerSignatureImage;

    const textFields = fieldNames.filter((name) => !name.includes('img')) // get text fields except for the ones which have img in their name (define in dictionary)
    const imageFields = fieldNames.filter((name) => name.includes('img')) // get text fields for the ones which have img in their name (define in dictionary)

    textFields.map((field) => {
      const nameField = form.getTextField(field);
      if (nameField) {
        nameField.setText(data[field])
      }
    })

    // Place images on the pdf buttons
    imageFields.map((fieldName) => {
      const imageField = form.getButton(fieldName) // Like form.getButton('owner_signature_img')
      if (signatures[fieldName] && imageField) {
        imageField.setImage(signatures[fieldName])
      }
    })

    // Add image to button field
      // const ownerSignatureField = form.getButton('owner_signature_img')
      // ownerSignatureField.setImage(ownerSignatureImage)

    // ****** Add image into signature field code start here ******
    // const signatureField = form.getSignature('owner_signature_img');
    // signatureField.acroField.getWidgets().forEach((widget) => {
    //   const { context } = widget.dict;
    //   const { width, height } = widget.getRectangle();
  
    //   const appearance = [
    //     ...drawRectangle({
    //       x: 0,
    //       y: 0,
    //       width,
    //       height,
    //       borderWidth: 0,
    //       color: rgb(1, 1, 1),
    //       borderColor: rgb(1, 0.5, 0.75),
    //       rotate: degrees(0),
    //       xSkew: degrees(0),
    //       ySkew: degrees(0),
    //     }),
  
    //     ...drawImage('owner_signature_img', {
    //       x: 5,
    //       y: 5,
    //       width: width - 10,
    //       height: height - 10,
    //       rotate: degrees(0),
    //       xSkew: degrees(0),
    //       ySkew: degrees(0),
    //     }),
    //   ];
    
    //   const stream = context.formXObject(appearance, {
    //     Resources: { XObject: { ['owner_signature_img']: ownerSignatureImage.ref } },
    //     BBox: context.obj([0, 0, width, height]),
    //     Matrix: context.obj([1, 0, 0, 1, 0, 0]),
    //   });
    //   const streamRef = context.register(stream);
  
    //   widget.setNormalAppearance(streamRef);
    // });
    // ****** Add image into signature field code ends here ******

    form.flatten(); // Disable input fields in the form
  
    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes).toString('base64');  // Convert to base64 string
  }

  async generateMultiplePdfs(filePath, entryIds) {
    if (entryIds.length === 1 ){
      const data = await this.formTemplateService.getDataForPdfGeneration(entryIds[0])
      return await this.fillBlankEntry(filePath, data)
    } else if (entryIds.length > 1) { // If entry ids are more than 1, then get fill template for all entries and then combine them to 1 pdf
      const pdfDoc = await PDFDocument.create();
      for (let entryId of entryIds) {
        // Get data for entry id, will fetch from db later
        const data = await this.formTemplateService.getDataForPdfGeneration(entryId)

        if(data) {
          const response = await this.fillBlankEntry(filePath, data) // Fill the template with data and get a base64 pdf buffer in response
          const tempDoc = await PDFDocument.load(response.toString());
          const [tempPage] = await pdfDoc.copyPages(tempDoc, [0]);
          pdfDoc.addPage(tempPage);
        }
      }

      const joinedPdfBytes = await pdfDoc.save();
      return Buffer.from(joinedPdfBytes).toString('base64');  // Convert to base64 string

    }
  }
  
  
}




