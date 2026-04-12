import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentIdentity } from './entities/agent-identity.entity';
import { ERC8004Service } from './erc8004.service';
import { ERC8004Controller } from './erc8004.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AgentIdentity])],
  controllers: [ERC8004Controller],
  providers: [ERC8004Service],
  exports: [ERC8004Service],
})
export class ERC8004Module { }
