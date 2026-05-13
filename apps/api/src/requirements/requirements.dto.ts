import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRequirementDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  totalWeight?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  pickupAddress?: string;

  @IsString()
  @IsOptional()
  sealedPhaseStart?: string;

  @IsString()
  @IsOptional()
  sealedPhaseEnd?: string;

  @IsOptional()
  invitedVendorIds?: any; // Validated in controller

  @IsString()
  @IsOptional()
  clientId?: string;
}

export class ClientApproveRequirementDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  targetPrice: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  totalWeight?: number;

  @IsString()
  @IsOptional()
  category?: string;
}
