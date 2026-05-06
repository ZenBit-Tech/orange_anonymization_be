import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourceTextToJobs1710000001000 implements MigrationInterface {
  name = 'AddSourceTextToJobs1710000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`jobs\` ADD \`sourceText\` text NULL`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`jobs\` DROP COLUMN \`sourceText\``);
  }
}