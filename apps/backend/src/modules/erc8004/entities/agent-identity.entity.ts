import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('agent_identity')
export class AgentIdentity {
  @PrimaryColumn({ type: 'varchar', length: 16, default: 'singleton' })
  id: string;

  @Column({ type: 'integer', nullable: true })
  agentId: number | null;

  @Column({ type: 'text', nullable: true })
  agentURI: string | null;
}
