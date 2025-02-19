
export interface MindeeModelConfig {
  name: string;
  version: string;
  endpoint: string;
  parameters?: Record<string, any>;
}

export const getLicensePlateModel = (): MindeeModelConfig => {
  const modelConfig = Deno.env.get('MINDEE_MODEL_CONFIG');
  
  if (!modelConfig) {
    // Fallback to default Mindee license plate model if no custom config
    return {
      name: 'mindee/license_plates',
      version: 'v1',
      endpoint: 'https://api.mindee.net/v1/products/mindee/license_plates/v1/predict'
    };
  }

  try {
    return JSON.parse(modelConfig);
  } catch (error) {
    console.error('Error parsing model config:', error);
    // Fallback to default model if parsing fails
    return {
      name: 'mindee/license_plates',
      version: 'v1',
      endpoint: 'https://api.mindee.net/v1/products/mindee/license_plates/v1/predict'
    };
  }
}
