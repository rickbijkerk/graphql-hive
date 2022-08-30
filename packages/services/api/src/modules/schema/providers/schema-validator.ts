import { Injectable, Scope } from 'graphql-modules';
import { parse, concatAST } from 'graphql';
import { Orchestrator, SchemaObject, Project } from '../../../shared/entities';
import { buildSchema, hashSchema } from '../../../shared/schema';
import * as Types from '../../../__generated__/types';
import { Logger } from '../../shared/providers/logger';
import { sentry } from '../../../shared/sentry';
import { Inspector } from './inspector';

export type ValidationResult = {
  isComposable: boolean;
  hasBreakingChanges: boolean;
  errors: Array<Types.SchemaError>;
  changes: Array<Types.SchemaChange>;
};

@Injectable({
  scope: Scope.Operation,
})
export class SchemaValidator {
  private logger: Logger;

  constructor(logger: Logger, private inspector: Inspector) {
    this.logger = logger.child({ service: 'SchemaValidator' });
  }

  @sentry('SchemaValidator.validate')
  async validate({
    orchestrator,
    selector,
    incoming,
    existing,
    isInitial,
    before,
    after,
    baseSchema,
    acceptBreakingChanges,
    project,
  }: {
    orchestrator: Orchestrator;
    isInitial: boolean;
    incoming: SchemaObject;
    existing: SchemaObject | null;
    before: readonly SchemaObject[];
    after: readonly SchemaObject[];
    selector: Types.TargetSelector;
    baseSchema: string | null;
    acceptBreakingChanges: boolean;
    project: Project;
  }): Promise<ValidationResult> {
    this.logger.debug('Validating Schema');
    const afterWithBase = baseSchema
      ? after.map((schema, index) => {
          if (index === 0) {
            return {
              ...schema,
              raw: (baseSchema || '') + schema.raw,
              document: concatAST([parse(baseSchema || ''), schema.document]),
            };
          } else {
            return schema;
          }
        })
      : after;

    const areIdentical = existing && hashSchema(existing) === hashSchema(incoming);

    if (areIdentical) {
      // todo: check the is_composable of the existing version and pass it here
      return {
        isComposable: true,
        hasBreakingChanges: false,
        errors: [],
        changes: [],
      };
    }

    const compositionErrors = await orchestrator.validate(
      afterWithBase,
      project.externalComposition.enabled ? project.externalComposition : null
    );

    if (isInitial) {
      return {
        isComposable: compositionErrors.length === 0,
        hasBreakingChanges: false,
        errors: compositionErrors,
        changes: [],
      };
    }

    let changes: Types.SchemaChange[] = [];
    let errors = [...compositionErrors];
    let hasBreakingChanges = false;

    try {
      const [existingSchema, incomingSchema] = await Promise.all([
        orchestrator.build(before, project.externalComposition),
        orchestrator.build(after, project.externalComposition),
      ]);
      if (existingSchema) {
        changes = await this.inspector.diff(buildSchema(existingSchema), buildSchema(incomingSchema), selector);

        hasBreakingChanges = changes.some(change => change.criticality === 'Breaking');

        if (hasBreakingChanges) {
          if (acceptBreakingChanges) {
            hasBreakingChanges = false;
            this.logger.debug('Breaking changes detected, but ignored');
          } else {
            this.logger.debug('Breaking changes detected');
            changes.forEach(change => {
              if (change.criticality === 'Breaking') {
                errors.push({
                  message: `Breaking Change: ${change.message}`,
                  path: change.path,
                });
              }
            });
          }
        }
      }
    } catch (error) {
      errors.push({
        message: `Failed to compare schemas: ${(error as Error).message}`,
      });
    }

    return {
      isComposable: compositionErrors.length === 0,
      hasBreakingChanges,
      errors,
      changes,
    };
  }
}
