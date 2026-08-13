import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsDateString, IsBoolean, Equals } from 'class-validator';

export class SignupDto {
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsEmail()
    @Matches(/@umt\.edu\.pk$/, {
        message: 'Email must be a valid @umt.edu.pk address',
    })
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsNotEmpty()
    @IsDateString()
    dateOfBirth: Date;

    @IsBoolean()
    @Equals(true, { message: 'You must accept the Terms & Conditions' })
    acceptedTerms: boolean;
}
