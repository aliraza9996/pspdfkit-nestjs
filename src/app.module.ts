import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { DocumentService } from './document.service';
import { PdfKitService } from './pdfkit.service';
import { FormTemplateService } from './template.service';
import { DataModule } from './entriesData.module';

@Module({
  imports: [HttpModule, DataModule],
  controllers: [AppController],
  providers: [AppService, DocumentService, PdfKitService, FormTemplateService],
})

export class AppModule {}
