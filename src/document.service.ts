import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { HttpModule } from '@nestjs/axios';
import { Stream } from 'stream';
// import * as sizeOf from 'image-size';
import * as PizZip from 'pizzip';
import { IncomingMessage } from 'http';
import * as sizeOf from 'image-size';
import * as fs from 'fs';


@Injectable()
export class DocumentService {


  async generateDocx(data: any): Promise<any> {
    const dataDir = "../templates";
    const content = fs.readFileSync( `templates/sample.docx`, 'binary')
    const Docxtemplater = require("docxtemplater")
    const ImageModule = require("docxtemplater-image-module")


    const imageOpts = {
      getImage: this.getImage(),
      getSize: function (img, tagValue, tagName) {
        // img is the value that was returned by getImage
        // This is to force the width to 600px, but keep the same aspect ratio
        // const sizeObj = sizeOf(img);
        const forceWidth = 600;
        // const ratio = forceWidth / sizeObj.width;
        return [
        //   forceWidth,
        //   // calculate height taking into account aspect ratio
        //   Math.round(sizeObj.height * ratio),
        '100px' , '100px'
        ];
      },
    };

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      modules: [new ImageModule(imageOpts)],
    });

    doc.setData(data);

    try {
        console.log('here')
    //   await doc.renderAsync();
        // await doc.render(data);
    } catch (error) {
      console.log(error);
      throw error;
    }

    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // const filePath = 'test.docx';
    // writeFileSync(filePath, buffer);

    fs.writeFileSync(`${dataDir}/ali.docx`, buffer);
    return Buffer.from(buffer).toString('base64');

  }

    getHttpData(url: string, callback: any) {
        console.log("Get http data")
        const https = require('https');
        const http = require('http');
        const stream = require('stream');
        const bufferStream = new stream.PassThrough();

        (url.substr(0, 5) === 'https' ? https : http)
        .request(url, { responseType: 'buffer' })
        .then((response: IncomingMessage) => {
            response.pipe(bufferStream);
            bufferStream.on('end', () => {
            callback(null, bufferStream.read());
        });
        bufferStream.on('error', (e) => {
            callback(e);
        });
        })
        .catch((error: Error) => {
            callback(error);
        });
    }

    async getImage() {
        const tagValue = "https://docxtemplater.com/xt-pro-white.png";
        const tagName = "signatureImage"
        const base64Value = this.base64Parser(tagValue);
        if (base64Value) {
            console.log("Has base64", base64Value)
            return base64Value;
        }
        // tagValue is "https://docxtemplater.com/xt-pro-white.png"
        // tagName is "image"
        return new Promise(function (resolve, reject) {
            console.log("Fetch image from url")
          this.getHttpData(tagValue, function (err, data) {
            if (err) {
                console.log("Error in axios")
                reject(err);
            }
            console.log(data)
            resolve(data);
          });
        });
    }


    async base64Parser(dataURL) {
    const base64Regex =/^data:image\/(png|jpg|svg|svg\+xml);base64,/;
    if (
        typeof dataURL !== "string" ||
        !base64Regex.test(dataURL)
    ) {
        return false;
    }
    const stringBase64 = dataURL.replace(base64Regex, "");

    // For nodejs, return a Buffer
    if (typeof Buffer !== "undefined" && Buffer.from) {
        return Buffer.from(stringBase64, "base64");
    }

    // // For browsers, return a string (of binary content) :
    // const binaryString = window.atob(stringBase64);
    // const len = binaryString.length;
    // const bytes = new Uint8Array(len);
    // for (let i = 0; i < len; i++) {
    //     const ascii = binaryString.charCodeAt(i);
    //     bytes[i] = ascii;
    // }
    // return bytes.buffer;
    // }
    // const imageOpts = {
    //     getImage(tag) {
    //         return base64Parser(tag);
    //     },
    //     getSize() {
    //         return [100, 100];
    //     },
    // };
    // const doc = new Docxtemplater(zip, {
    //     modules: [new ImageModule(imageOpts)],
    // });
    }
}




