import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validator that checks if the file size exceeds the maximum size
 * This is a replacement for the removed @angular-material-components/file-input MaxSizeValidator
 */
export class MaxSizeValidator {
  static maxContentSize(maxSize: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      
      if (!file) {
        return null;
      }

      // If it's a FileList
      if (file instanceof FileList) {
        for (let i = 0; i < file.length; i++) {
          if (file[i].size > maxSize) {
            return {
              maxContentSize: {
                actualSize: file[i].size,
                maxSize: maxSize,
                file: file[i].name
              }
            };
          }
        }
        return null;
      }

      // If it's a single File
      if (file instanceof File) {
        if (file.size > maxSize) {
          return {
            maxContentSize: {
              actualSize: file.size,
              maxSize: maxSize,
              file: file.name
            }
          };
        }
        return null;
      }

      return null;
    };
  }
}

