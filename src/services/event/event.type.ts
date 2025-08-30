



export class Verification_Mail{
    constructor(public readonly email:string,
        public readonly code:string,
        public readonly name:string,
        // private readonly expiry:Date,
        public readonly year:number
    ){}
}