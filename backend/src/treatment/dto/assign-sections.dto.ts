import {
  ArrayMinSize,
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChatType } from '../../chat/constants/chat-type.enum';

export class SectionAssignmentItemDto {
  @IsEnum(ChatType)
  sectionType: ChatType;

  @IsInt()
  @Min(1)
  @Max(5)
  sortOrder: number;

  @IsOptional()
  @IsString()
  doctorNotes?: string;
}

export class AssignSectionsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => SectionAssignmentItemDto)
  sections: SectionAssignmentItemDto[];
}

export class AssignSectionsParamsDto {
  @IsUUID()
  userId: string;
}
