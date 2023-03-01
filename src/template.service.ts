import { Injectable, Inject } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { readFileSync } from 'fs';
import { PdfKitService } from './pdfkit.service';
import { forwardRef } from '@nestjs/common';

@Injectable()
export class FormTemplateService {
  constructor(
    @Inject(forwardRef(() => PdfKitService))
    private readonly PdfKitService: PdfKitService
    ) {}


  // Fill RTO Template Form
  async RtoTemplateFill(filePath) {
    // Read file
    const templateBytes = readFileSync(filePath);

    // Load PDF
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm() // Get form from PDF
    const fields = form.getFields(); // Get PDF form fields

    const fieldNames = fields.map(field => field.getName());  // Get field names
    console.log(fieldNames) // Console field names

    const ownerSignatureUrl = 'https://pdf-lib.js.org/assets/mario_emblem.png';
    const roderSignatureUrl = '';
    const trainerSignatureUrl = '';

    // const ownerSignatureBytes = await this.getImageData(ownerSignatureUrl);
    const ownerSignatureBytes = await this.PdfKitService.fetchSignatre();

    const ownerSignatureImage = await pdfDoc.embedPng(ownerSignatureBytes);

    // const ownerSignatureField = form.getButton('owner_signature')
    // ownerSignatureField.setImage(ownerSignatureImage)

    const data = {
      owner_name: "Ali Raza",
      rider_name: "Haider Ali",
      trainer_name: "Mohsin Ali",
      agreement: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer mollis, mi laoreet tempor varius, metus turpis tristique sapien, id consequat eros nisi a quam. Nullam ornare orci non nibh iaculis, sit amet porta nisi blandit. Etiam sed eros id justo pellentesque dignissim vitae eget tortor. Aenean auctor at turpis nec sagittis. Nulla eu nulla ligula. Duis dignissim, massa sed mattis auctor, nulla urna rhoncus ipsum, vel luctus justo nisi eu metus. Curabitur est orci, ultricies nec pretium sit amet, blandit eget lectus. Pellentesque eu placerat nulla. Praesent eu erat suscipit urna dictum molestie. Etiam vitae orci eget ante tempor pulvinar. Aliquam tempor sagittis sapien interdum congue. Cras vehicula nisi dictum tellus ultrices, sit amet semper dui faucibus. Ut ipsum orci, condimentum eget sem vel, suscipit aliquet urna. Quisque malesuada nibh laoreet, tincidunt purus vitae, aliquam ante. Maecenas velit arcu, ultricies quis mollis id, pulvinar maximus ipsum. Mauris congue efficitur nisi tincidunt ultricies. Duis eget sollicitudin lacus. Aliquam ut est eu neque posuere condimentum. Ut ac elit porta ligula convallis tristique convallis at sem. Duis et elementum massa, nec sagittis turpis. Morbi eget vehicula est. Suspendisse imperdiet lacus felis, sit amet molestie turpis congue nec. Duis malesuada mi et libero luctus, dapibus pretium augue blandit. Aliquam odio massa, tempor vel blandit sed, laoreet nec dolor. Nullam eget felis risus.     Integer scelerisque, orci sit amet dignissim egestas, nisl tellus sagittis nunc, at tristique felis massa non lectus. Integer semper metus nisi, accumsan tincidunt sem scelerisque vel. Donec fringilla blandit neque quis eleifend. In ullamcorper velit mauris, ultrices pellentesque tortor blandit non. Mauris gravida orci interdum velit condimentum, vel feugiat sapien interdum. Aliquam luctus ex at leo elementum luctus. Quisque bibendum vulputate congue. Proin imperdiet ornare neque, non tristique lectus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Quisque vitae metus a ipsum pellentesque tempus in a velit. Morbi vel arcu ut lectus faucibus facilisis quis quis sem. Nam ac ipsum porttitor, porta dui vitae, vestibulum purus. Suspendisse id lacus id mauris convallis lobortis. Maecenas eget consequat lectus, ut tempor massa. Mauris efficitur semper ultricies."
    }
    const textFields = fieldNames.filter((name) => !name.includes('img'))

    textFields.map((field) => {
      const nameField = form.getTextField(field);
      if (nameField) {
        nameField.setText(data[field])
      }
    })

    const imageFields = fieldNames.filter((name) => name.includes('img'))

    imageFields.map((fieldName) => {
      const imageField = form.getButton(fieldName);
    })



    form.flatten(); // Disable input fields in the form
    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes).toString('base64');  // Convert to base64 string
  }

  

}




