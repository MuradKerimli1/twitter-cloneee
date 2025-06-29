import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsDateString,
} from "class-validator";
import { Gender } from "../../../dal/enums/genderEnum";
import { UserRole } from "../../../dal/enums/userRole";

export class UserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long." })
  @MaxLength(30, { message: "Password must be at most 20 characters long." })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: "Username must be at least 3 characters long." })
  @MaxLength(50, { message: "Username must be at most 50 characters long." })
  username: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;
}
