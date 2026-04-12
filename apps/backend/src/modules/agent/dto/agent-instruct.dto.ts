import { IsString, MaxLength, MinLength } from 'class-validator';

export class AgentInstructDto {
  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  instruction!: string;
}
