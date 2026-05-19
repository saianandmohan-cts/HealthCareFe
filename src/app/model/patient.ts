export class Patient {
  constructor(
    public patientId: number,
    public name: string,
    public age: number,
    public gender: string,
    
    public email: string,
    public password: string
  ) {}
}