import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  heroImageUrl: string = 'https://media.vanguardcommunications.net/photo-VCG-HPI-COVID19-Male-Doc-Male-Pt-2000px.jpg';
  careImageUrl: string = 'https://www.muhealth.org/sites/default/files/2022-05/Child%20with%20doctor-1040x615.jpg';
  constructor(private router: Router) {}
  go(path: string) { 
    this.router.navigate([path]); 
  }
}