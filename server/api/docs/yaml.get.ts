import YAML from 'yaml';

/**
 * GET /api/docs/yaml
 * Returns the OpenAPI specification in YAML format
 */
export default defineEventHandler(async (event) => {
  const spec = generateOpenAPISpec();

  setResponseHeader(event, 'Content-Type', 'application/x-yaml');
  setResponseHeader(event, 'Content-Disposition', 'inline; filename="openapi.yaml"');

  return YAML.stringify(spec);
});
