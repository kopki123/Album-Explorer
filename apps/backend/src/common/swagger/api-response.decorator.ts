import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiResponseDto } from '../dto/api-response.dto';

export function ApiOkResponseEnvelope<TModel extends Type<unknown>>(
  model: TModel,
  description?: string,
) {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
}

export function ApiOkResponseEnvelopeWithMeta<
  TData extends Type<unknown>,
  TMeta extends Type<unknown>,
>(data: TData, meta: TMeta, description?: string) {
  return applyDecorators(
    ApiExtraModels(ApiResponseDto, data, meta),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(data) },
              meta: { $ref: getSchemaPath(meta) },
            },
          },
        ],
      },
    }),
  );
}
