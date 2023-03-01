import { Injectable, Inject } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { readFileSync, writeFileSync } from 'fs';
import { HttpService } from '@nestjs/axios';
import * as path from 'path';
import * as fs from 'fs';
import { FormTemplateService } from './template.service';
import { forwardRef } from '@nestjs/common';

@Injectable()
export class PdfKitService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => FormTemplateService))
    private readonly formTemplateService: FormTemplateService,
    ) {}
    
  async getImageData(url) {
    const response = await this.httpService.get(url, { responseType: 'arraybuffer' }).toPromise();
    console.log(response.data)
    return response.data;
  }

  async fetchSignatre() {
    const response = await this.httpService.get('https://showgroundslive.com/webservice/FetchDigitalSignatures?customer_id=15&sig_id=1&hash=1212').toPromise();
    const base64string = response.data.data;
    const base64Buffer = Buffer.from(base64string, 'base64');
    return base64Buffer;
  }

  getTemplate = async () => {
    const templateBytes = readFileSync('templates/document (3).pdf');
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const firstPage = pages[0];

    // // Write text vertically in the centre
    // const { width, height } = firstPage.getSize()
    // firstPage.drawText('Created by JTPL!', {
    //   x: 5,
    //   y: height / 2 + 300,
    //   size: 50,
    //   font: helveticaFont,
    //   color: rgb(0.95, 0.1, 0.1),
    //   rotate: degrees(-45),
    // })


    // Create Form
    const page = pdfDoc.addPage([550, 750])
    const form = pdfDoc.getForm()
    page.drawText('Enter your favorite superhero:', { x: 50, y: 700, size: 20 })
    page.drawText('Enter your favorite superhero:', { x: 50, y: 800, size: 20 })

    page.drawText('Enter your favorite superhero:', { x: 50, y: 900, size: 20 })
    page.drawText('Enter your favorite superhero:', { x: 50, y: 1000, size: 20 })
    page.drawText('Enter your favorite superhero:', { x: 50, y: 1100, size: 20 })
    page.drawText('Enter your favorite superhero:', { x: 50, y: 7122, size: 20 })

    const ownerNameField  = form.createTextField('owner_name')
    ownerNameField.setText('One Punch Manaaaaaaaaaaaaaaaaaaaa')
    ownerNameField.addToPage(page, { x: 55, y: 640 })
    const pdfBytes = await pdfDoc.save()
    writeFileSync('templates/editedpdf.pdf', pdfBytes)
    return 'true';
  }

  async fillForm() {
    const templateBytes = readFileSync('templates/realsample1.pdf');
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm()
    const fields = form.getFields();

        
    const fieldNames = fields.map(field => field.getName());
    console.log(fieldNames)
    // const marioUrl = 'https://pdf-lib.js.org/assets/small_mario.png'
    // const marioImageBytes = await fetch(marioUrl).then(res => res.arrayBuffer())
  
    const emblemUrl = 'https://pdf-lib.js.org/assets/mario_emblem.png'
    // const emblemImageBytes = await fetch(emblemUrl).then(res => res.arrayBuffer())
    const emblemImageBytes = await this.getImageData(emblemUrl)

    // const marioImage = await pdfDoc.embedPng(marioImageBytes)
    const emblemImage = await pdfDoc.embedPng(emblemImageBytes)
  
    const imageFields = form.getButton('image')
    imageFields.setImage(emblemImage)

    const image2 = form.getButton('image2')
    image2.setImage(emblemImage)

    // const image4 = form.getButton('image4')
    // image4.setImage(emblemImage)


    // const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    // const page = pdfDoc.getPages()[0];
    // const textField = form.createTextField('owner_name');
    // textField.setText(''); // Set initial text value here
    // textField.addToPage(page, {
    //   x: 50, // X coordinate of the text field
    //   y: 700, // Y coordinate of the text field
    //   width: 500, // Width of the text field
    //   height: 20, // Height of the text field
    //   font: helveticaFont,
    //   // fontSize: 12,
    // });
    // const nameField = form.getTextField('owner_name')
    // nameField.setText('ALI RAZA JAVAID')



    const agreement = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer mollis, mi laoreet tempor varius, metus turpis tristique sapien, id consequat eros nisi a quam. Nullam ornare orci non nibh iaculis, sit amet porta nisi blandit. Etiam sed eros id justo pellentesque dignissim vitae eget tortor. Aenean auctor at turpis nec sagittis. Nulla eu nulla ligula. Duis dignissim, massa sed mattis auctor, nulla urna rhoncus ipsum, vel luctus justo nisi eu metus. Curabitur est orci, ultricies nec pretium sit amet, blandit eget lectus. Pellentesque eu placerat nulla. Praesent eu erat suscipit urna dictum molestie. Etiam vitae orci eget ante tempor pulvinar. Aliquam tempor sagittis sapien interdum congue. Cras vehicula nisi dictum tellus ultrices, sit amet semper dui faucibus. Ut ipsum orci, condimentum eget sem vel, suscipit aliquet urna. Quisque malesuada nibh laoreet, tincidunt purus vitae, aliquam ante. Maecenas velit arcu, ultricies quis mollis id, pulvinar maximus ipsum. Mauris congue efficitur nisi tincidunt ultricies. Duis eget sollicitudin lacus. Aliquam ut est eu neque posuere condimentum. Ut ac elit porta ligula convallis tristique convallis at sem. Duis et elementum massa, nec sagittis turpis. Morbi eget vehicula est. Suspendisse imperdiet lacus felis, sit amet molestie turpis congue nec. Duis malesuada mi et libero luctus, dapibus pretium augue blandit. Aliquam odio massa, tempor vel blandit sed, laoreet nec dolor. Nullam eget felis risus.     Integer scelerisque, orci sit amet dignissim egestas, nisl tellus sagittis nunc, at tristique felis massa non lectus. Integer semper metus nisi, accumsan tincidunt sem scelerisque vel. Donec fringilla blandit neque quis eleifend. In ullamcorper velit mauris, ultrices pellentesque tortor blandit non. Mauris gravida orci interdum velit condimentum, vel feugiat sapien interdum. Aliquam luctus ex at leo elementum luctus. Quisque bibendum vulputate congue. Proin imperdiet ornare neque, non tristique lectus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Quisque vitae metus a ipsum pellentesque tempus in a velit. Morbi vel arcu ut lectus faucibus facilisis quis quis sem. Nam ac ipsum porttitor, porta dui vitae, vestibulum purus. Suspendisse id lacus id mauris convallis lobortis. Maecenas eget consequat lectus, ut tempor massa. Mauris efficitur semper ultricies."
    const agreementField = form.getTextField('agreement');
    agreementField.setText(agreement);
    


    // const nameField = form.getTextField('CharacterName 2')
    // const ageField = form.getTextField('Age')
    // const heightField = form.getTextField('Height')
    // const weightField = form.getTextField('Weight')
    // const eyesField = form.getTextField('Eyes')
    // const skinField = form.getTextField('Skin')
    // const hairField = form.getTextField('Hair')
  
    // const alliesField = form.getTextField('Allies')
    // const factionField = form.getTextField('FactionName')
    // const backstoryField = form.getTextField('Backstory')
    // const traitsField = form.getTextField('Feat+Traits')
    // const treasureField = form.getTextField('Treasure')
  
    // // const characterImageField = form.getButton('CHARACTER IMAGE')
    // const factionImageField = form.getButton('Faction Symbol Image')
  
    // nameField.setText('Mario')
    // ageField.setText('24 years')
    // heightField.setText(`5' 1"`)
    // weightField.setText('196 lbs')
    // eyesField.setText('blue')
    // skinField.setText('white')
    // hairField.setText('brown')
  
    // // characterImageField.setImage(marioImage)
  
    // alliesField.setText(
    //   [
    //     `Allies:`,
    //     `  • Princess Daisy`,
    //     `  • Princess Peach`,
    //     `  • Rosalina`,
    //     `  • Geno`,
    //     `  • Luigi`,
    //     `  • Donkey Kong`,
    //     `  • Yoshi`,
    //     `  • Diddy Kong`,
    //     ``,
    //     `Organizations:`,
    //     `  • Italian Plumbers Association`,
    //   ].join('\n'),
    // )
  
    // factionField.setText(`Mario's Emblem`)
  
    // factionImageField.setImage(emblemImage)
  
    // agreementField.setText(
    //   [
    //     `Mario is a fictional character in the Mario video game franchise, `,
    //     `owned by Nintendo and created by Japanese video game designer Shigeru `,
    //     `Miyamoto. Serving as the company's mascot and the eponymous `,
    //     `protagonist of the series, Mario has appeared in over 200 video games `,
    //     `since his creation. Depicted as a short, pudgy, Italian plumber who `,
    //     `resides in the Mushroom Kingdom, his adventures generally center `,
    //     `upon rescuing Princess Peach from the Koopa villain Bowser. His `,
    //     `younger brother and sidekick is Luigi.`,
    //   ].join('\n'),
    // )
  
    // traitsField.setText(
    //   [
    //     `Mario can use three basic three power-ups:`,
    //     `  • the Super Mushroom, which causes Mario to grow larger`,
    //     `  • the Fire Flower, which allows Mario to throw fireballs`,
    //     `  • the Starman, which gives Mario temporary invincibility`,
    //   ].join('\n'),
    // )
    // treasureField.setText(['• Gold coins', '• Treasure chests'].join('\n'))
  
    form.flatten();
    const pdfBytes = await pdfDoc.save()


    writeFileSync('templates/realpz.pdf', pdfBytes)

  }

  async getPdfList() {
    const pdfDirectory = path.join(__dirname, '..', 'templates');

    const files = await fs.promises.readdir(pdfDirectory);
    const pdfFiles = files.filter(file => path.extname(file) === '.pdf');
    return pdfFiles;

  }

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

 

  async generatePdf(filename) {
    const pdfDirectory = path.join(__dirname, '..', 'templates');
    const filePath = path.join(pdfDirectory, filename);

    const fileExists = fs.existsSync(filePath);
    if (!fileExists) {
      return {message: "File does not exist"}
    }

    return await this.formTemplateService.RtoTemplateFill(filePath);
  }

}




