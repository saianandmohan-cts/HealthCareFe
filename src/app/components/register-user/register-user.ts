import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-user',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-user.html',
  styleUrl: './register-user.css',
})
export class RegisterUser {

  
registerForm!: FormGroup;
  submitError = '';

  isSubmitted=false;

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  genders = ['Male', 'Female', 'Other'];

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      gender: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      address: ['', Validators.required],
      pastProblem: [''],
      allergic: ['', Validators.required]
    });
  }

  
get f() {
    return this.registerForm.controls;
  }

  get name() {
  return this.registerForm.controls['name'];
}

get age() {
  return this.registerForm.controls['age'];
}

get email() {
  return this.registerForm.controls['email'];
}

get password() {
  return this.registerForm.controls['password'];
}

get address() {
  return this.registerForm.controls['address'];
}

get gender() {
  return this.registerForm.controls['gender'];
}

get bloodGroup() {
  return this.registerForm.controls['bloodGroup'];
}

get allergic() {
  return this.registerForm.controls['allergic'];
}


  onSubmit(): void {
    this.submitError = '';

    // if (this.registerForm.invalid) {
    //   this.submitError = 'Please fill all required fields correctly';
    //   return;
    // }

    // console.log('Patient Registered:', this.registerForm.value);

    // // Later replace with API call
    // this.router.navigate(['/login-user']);


    
  this.isSubmitted = true;

  if (this.registerForm.invalid) {
    this.submitError = 'Please fill all required fields correctly';
    return;
  }

  console.log(this.registerForm.value);
  this.router.navigate(['/login-user']);

  }



}
