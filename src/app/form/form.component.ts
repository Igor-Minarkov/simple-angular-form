import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { CsvService } from '../services/csv.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  form: FormGroup;
  csvData: any[] = [];
  originalFormValue: any;
  showWarning: boolean = false;
  cumulativeError: string = '';
  submitAttempted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private csvService: CsvService
  ) {
    this.form = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/),
        ],
      ],
      subscription: ['Advanced'],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
          ),
        ],
      ],
      csvFile: [null],
    });

    this.originalFormValue = this.form.value;
  }

  ngOnInit() {
    ['email', 'password'].forEach((field) => {
      const control = this.form.get(field);
      control?.valueChanges.pipe(debounceTime(500)).subscribe(() => {
        // Check if the control has been touched or is dirty before showing the warning.
        if (control.touched || control.dirty) {
          this.showWarning = control.invalid;
        }
      });
    });
  }

  onFileChange(event: any) {
    let reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsText(file);

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.csvData = this.csvService.parseCsv(reader.result);
        }
      };
    }
  }

  clearForm() {
    if (
      JSON.stringify(this.form.value) ===
        JSON.stringify(this.originalFormValue) ||
      window.confirm('Are you sure you want to discard changes?')
    ) {
      this.form.reset(this.originalFormValue);

      // Mark the form as pristine and untouched to ensure field-specific error messages are hidden.
      this.form.markAsPristine();
      this.form.markAsUntouched();

      // Reset the component-level flags that might control error message display.
      this.submitAttempted = false;
      this.showWarning = false;
      this.cumulativeError = ''; // Clearing the cumulativeError here to make sure it's reset

      this.cdr.detectChanges();
    }
  }

  clearCumulativeError() {
    this.cumulativeError = '';
    this.submitAttempted = false;
  }

  onSubmit() {
    if (this.form.valid) {
      this.router.navigate(['/display'], {
        state: { formData: this.form.value, csvData: this.csvData },
      });
    } else {
      this.submitAttempted = true;
      this.cumulativeError = 'The following errors occurred: ';

      if (this.form.get('email')?.invalid) {
        this.cumulativeError += ' Invalid Email.';
      }
      if (this.form.get('password')?.invalid) {
        this.cumulativeError += ' Invalid Password.';
      }
    }
  }
}
