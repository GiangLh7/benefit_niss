import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DocumentTypeOption } from '../../constants/document-types.constants';

export interface DocumentRow {
  id: string;
  documentType: string;
  file: File | null;
  uploadedAt?: Date;
}

@Component({
  standalone: false,
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css']
})
export class DocumentUploadComponent implements OnInit {
  @Input() benefitLabel: string = '';
  @Input() availableDocumentTypes: DocumentTypeOption[] = [];
  @Input() initialDocumentRows: DocumentRow[] = [];

  @Output() documentsChanged = new EventEmitter<DocumentRow[]>();
  @Output() validationChanged = new EventEmitter<boolean>();

  documentRows: DocumentRow[] = [];

  ngOnInit(): void {
    // Initialize with provided rows or create one empty row
    if (this.initialDocumentRows && this.initialDocumentRows.length > 0) {
      this.documentRows = [...this.initialDocumentRows];
    } else {
      this.addDocumentRow();
    }
  }

  /**
   * Add new document row
   */
  addDocumentRow(): void {
    const newRow: DocumentRow = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      documentType: '',
      file: null
    };
    this.documentRows.push(newRow);
    this.emitChanges();
  }

  /**
   * Remove document row
   */
  removeDocumentRow(rowId: string): void {
    if (this.documentRows.length > 1) {
      this.documentRows = this.documentRows.filter(row => row.id !== rowId);
      this.emitChanges();
    }
  }

  /**
   * Handle document type selection
   */
  onDocumentTypeSelected(rowId: string, docType: string): void {
    const row = this.documentRows.find(r => r.id === rowId);
    if (row) {
      row.documentType = docType;
      this.emitChanges();
    }
  }

  /**
   * Handle file selection for document row
   */
  onDocumentFileSelected(event: any, rowId: string): void {
    const file = event.target.files[0];
    if (file) {
      const row = this.documentRows.find(r => r.id === rowId);
      if (row) {
        row.file = file;
        row.uploadedAt = new Date();
        this.emitChanges();
      }
    }
  }

  /**
   * Check if at least one document uploaded
   */
  hasAtLeastOneDocument(): boolean {
    return this.documentRows.some(row => row.documentType && row.file);
  }

  /**
   * Get count of uploaded documents
   */
  getUploadedDocumentCount(): number {
    return this.documentRows.filter(row => row.documentType && row.file).length;
  }

  /**
   * Emit changes to parent
   */
  private emitChanges(): void {
    this.documentsChanged.emit(this.documentRows);
    this.validationChanged.emit(this.hasAtLeastOneDocument());
  }

  /**
   * Trigger file input click
   */
  triggerFileInput(rowId: string): void {
    const fileInput = document.getElementById('file-' + rowId) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
}

